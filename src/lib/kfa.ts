/**
 * KFA(대한축구협회) 홈페이지 스크래퍼
 * 경기 일정/결과 및 선수단 정보를 제공합니다.
 */
import * as cheerio from "cheerio";

const KFA_BASE = "https://www.kfa.or.kr";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

// 포지션 영문 → 한글
const POSITION_KO: Record<string, string> = {
  gk: "골키퍼", df: "수비수", mf: "미드필더", fw: "공격수",
};

// 한국 도시/지명 목록 (홈 경기 판별)
const KOREA_LOCATIONS = [
  "서울", "수원", "인천", "대전", "광주", "대구", "부산", "울산",
  "전주", "성남", "용인", "고양", "파주", "이천", "화성", "제주",
  "안산", "창원", "포항", "천안", "상주", "세종",
];

function isKoreaHome(venue: string): boolean {
  return KOREA_LOCATIONS.some((city) => venue.includes(city));
}

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// "토요일 03-28" + year → "2026-03-28T00:00:00+09:00"
function parseKFADate(dateStr: string, year: number, timeStr = ""): string {
  const m = dateStr.match(/(\d{2})-(\d{2})/);
  if (!m) return new Date().toISOString();
  const [, mon, day] = m;

  // 시간 파싱 "PM 11 : 00" or "AM 03 : 45"
  let hours = 0, mins = 0;
  const t = timeStr.replace(/&nbsp;/g, " ").trim();
  const tm = t.match(/(AM|PM)\s*(\d+)\s*[:\s]\s*(\d+)/i);
  if (tm) {
    hours = parseInt(tm[2]);
    mins = parseInt(tm[3]);
    if (tm[1].toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (tm[1].toUpperCase() === "AM" && hours === 12) hours = 0;
  }

  const dateObj = new Date(
    `${year}-${mon}-${day}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00+09:00`
  );
  return dateObj.toISOString();
}

// 연월 계산 헬퍼
function addMonths(year: number, month: number, delta: number) {
  let m = month + delta;
  let y = year;
  while (m > 12) { m -= 12; y++; }
  while (m < 1) { m += 12; y--; }
  return { year: y, month: m };
}

// KFA 일정 페이지 HTML fetch (특정 연월)
async function fetchKFAMonthPage(year: number, month: number): Promise<string> {
  // 현재 연월 기준으로 URL을 구성
  const today = new Date();
  const curYear = today.getFullYear();
  const curMonth = today.getMonth() + 1;

  // 기준월과의 차이 계산
  const diffMonths = (year - curYear) * 12 + (month - curMonth);

  let url: string;
  if (diffMonths === 0) {
    url = `${KFA_BASE}/live/live.php?act=match_schedule`;
  } else if (diffMonths < 0) {
    // 이전 달: date_div=pre, now_date=다음달
    const { year: ny, month: nm } = addMonths(year, month, 1);
    const nm2 = String(nm).padStart(2, "0");
    url = `${KFA_BASE}/live/live.php?act=match_schedule&date_div=pre&now_date=${ny}-${nm2}`;
  } else {
    // 이후 달: date_div=next, now_date=이전달
    const { year: py, month: pm } = addMonths(year, month, -1);
    const pm2 = String(pm).padStart(2, "0");
    url = `${KFA_BASE}/live/live.php?act=match_schedule&date_div=next&now_date=${py}-${pm2}`;
  }

  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`KFA fetch error: ${res.status}`);
  return res.text();
}

// KFA 일정 페이지 → 경기 목록 파싱
function parseScheduleHtml(html: string, year: number): KFAMatchRaw[] {
  const $ = cheerio.load(html);
  const matches: KFAMatchRaw[] = [];

  $("td").each((_, td) => {
    const block = $(td);

    // 경기 ID
    const idMatch = block.html()?.match(/match_schedule_national_result\('(\d+)'\)/);
    if (!idMatch) return;
    const id = idMatch[1];

    // 대회명
    const titleEl = block.find(".count_title");
    const rawTitle = titleEl.clone().children().remove().end().text().trim();
    const competition = rawTitle || stripHtml(titleEl.html() || "");

    // 날짜
    const dateRaw = block.find(".count_date").text().trim();
    // 장소
    const venueRaw = stripHtml(block.find(".count_from").html() || "");
    // 한국팀
    const korTeam = block.find(".vs_korea").text().trim();
    if (!korTeam) return;
    // 상대팀
    const opponent = block.find("li.vs_mexico").text().trim();

    // 스코어 (vs_num 내 li들)
    const vsNumLis = block.find(".vs_num li");
    let korScore: number | null = null;
    let oppScore: number | null = null;
    let korWon: boolean | null = null;
    let isFinished = false;

    if (vsNumLis.length >= 2) {
      const s1 = parseInt($(vsNumLis[0]).text().trim());
      const s2 = parseInt($(vsNumLis[1]).text().trim());
      if (!isNaN(s1) && !isNaN(s2)) {
        korScore = s1;
        oppScore = s2;
        isFinished = true;
        korWon = s1 > s2 ? true : s1 < s2 ? false : null;
      }
    }

    matches.push({
      id,
      competition: competition.replace(/\s+/g, " ").trim(),
      dateStr: parseKFADate(dateRaw, year),
      venue: venueRaw,
      korTeam,
      opponent,
      korScore,
      oppScore,
      korWon,
      isFinished,
    });
  });

  return matches;
}

// 홈페이지 next_schedule → 예정 경기 파싱
function parseUpcomingHtml(html: string): KFAMatchRaw[] {
  const $ = cheerio.load(html);
  const matches: KFAMatchRaw[] = [];
  const today = new Date();

  $("ul.next_schedule > li").each((_, li) => {
    const block = $(li);
    const text = block.text();

    // 날짜 추출 "03-28 토요일" or "토요일 03-28"
    const dateMatch = text.match(/(\d{2})-(\d{2})/);
    if (!dateMatch) return;
    const [, mon, day] = dateMatch;
    let year = today.getFullYear();
    // 월이 현재보다 작으면 내년
    if (parseInt(mon) < today.getMonth() + 1) year++;
    if (parseInt(mon) === today.getMonth() + 1 && parseInt(day) < today.getDate()) year++;

    // 시간 "PM 11 : 00"
    const timeMatch = text.match(/(AM|PM)\s*\d+\s*[:\s]\s*\d+/i);
    const timeStr = timeMatch ? timeMatch[0] : "";
    const dateIso = parseKFADate(`${mon}-${day}`, year, timeStr);

    // 대회명 (첫 번째 줄)
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const competition = lines[0] || "";

    // 장소 (두 번째 줄)
    const venue = lines[1] || "";

    // 팀명 추출 (li 내 마지막 2개 텍스트 노드)
    const teamItems = block.find("li");
    let korTeam = "";
    let opponent = "";
    if (teamItems.length >= 2) {
      korTeam = $(teamItems[teamItems.length - 2]).text().trim();
      opponent = $(teamItems[teamItems.length - 1]).text().trim();
    } else {
      // 텍스트에서 대한민국 다음 줄
      const idx = lines.findIndex((l) => l.includes("대한민국"));
      if (idx >= 0) {
        korTeam = lines[idx];
        opponent = lines[idx + 1] || "";
      }
    }

    // 링크에서 URL의 now_date로 팀 키워드 파악은 어렵, competition으로 파악
    const onclick = block.attr("onclick") || "";
    const href = onclick.match(/now_date=(\d{4}-\d{2})/)?.[1] || "";

    matches.push({
      id: `upcoming-${mon}-${day}-${opponent}`,
      competition: competition.replace(/\s+/g, " ").trim(),
      dateStr: dateIso,
      venue,
      korTeam: korTeam || "대한민국",
      opponent,
      korScore: null,
      oppScore: null,
      korWon: null,
      isFinished: false,
    });
  });

  return matches;
}

interface KFAMatchRaw {
  id: string;
  competition: string;
  dateStr: string;
  venue: string;
  korTeam: string;
  opponent: string;
  korScore: number | null;
  oppScore: number | null;
  korWon: boolean | null;
  isFinished: boolean;
}

// KFAMatchRaw → 앱의 Match 형식으로 변환
function toMatch(raw: KFAMatchRaw, teamId: number): import("@/types/football").Match {
  const timestamp = new Date(raw.dateStr).getTime() / 1000;
  const home = isKoreaHome(raw.venue);

  const koreaTeam = {
    id: teamId,
    name: raw.korTeam,
    nameKo: raw.korTeam,
    logo: "https://media.api-sports.io/football/teams/10177.png",
    winner: raw.korWon,
  };
  const oppTeam = {
    id: 0,
    name: raw.opponent,
    nameKo: raw.opponent,
    logo: `https://img.kfa.or.kr/nation_flag/`,
    winner: raw.korWon === null ? null : !raw.korWon,
  };

  return {
    id: parseInt(raw.id) || Math.abs(raw.id.split("").reduce((a, c) => a * 31 + c.charCodeAt(0), 0)) % 1000000,
    date: raw.dateStr,
    timestamp,
    status: {
      short: raw.isFinished ? "FT" : "NS",
      long: raw.isFinished ? "Match Finished" : "Not Started",
      longKo: raw.isFinished ? "종료" : "예정",
    },
    league: {
      id: 0,
      name: raw.competition,
      nameKo: raw.competition,
      logo: "",
    },
    homeTeam: home ? koreaTeam : oppTeam,
    awayTeam: home ? oppTeam : koreaTeam,
    venue: { name: raw.venue },
    score: {
      home: home ? raw.korScore : raw.oppScore,
      away: home ? raw.oppScore : raw.korScore,
    },
  };
}

// ─────────────────────────────────────────────
// 공개 API
// ─────────────────────────────────────────────

/**
 * KFA 일정 페이지에서 특정 팀의 최근 5경기 + 예정 경기를 가져옵니다.
 */
export async function getKFAFixtures(
  teamId: number,
  kfaTeamKeyword: string
): Promise<import("@/types/football").Match[]> {
  const today = new Date();
  const curYear = today.getFullYear();
  const curMonth = today.getMonth() + 1;

  // 최근 4개월 + 현재 + 향후 2개월 fetch
  const months: { year: number; month: number }[] = [];
  for (let d = -4; d <= 2; d++) {
    months.push(addMonths(curYear, curMonth, d));
  }

  const [homeHtml, ...monthHtmls] = await Promise.all([
    fetch(`${KFA_BASE}`, { headers: HEADERS, next: { revalidate: 1800 } }).then((r) => r.text()).catch(() => ""),
    ...months.map(({ year, month }) =>
      fetchKFAMonthPage(year, month).catch(() => "")
    ),
  ]);

  // 예정 경기 (홈페이지)
  const upcoming = parseUpcomingHtml(homeHtml).filter((m) =>
    filterByTeam(m, kfaTeamKeyword)
  );

  // 과거 결과
  const results: KFAMatchRaw[] = [];
  for (let i = 0; i < monthHtmls.length; i++) {
    const { year } = months[i];
    const parsed = parseScheduleHtml(monthHtmls[i], year).filter((m) =>
      filterByTeam(m, kfaTeamKeyword) && m.isFinished
    );
    results.push(...parsed);
  }

  // 중복 제거 (id 기준)
  const seen = new Set<string>();
  const allMatches = [...upcoming, ...results].filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  return allMatches.map((m) => toMatch(m, teamId));
}

function filterByTeam(m: KFAMatchRaw, keyword: string): boolean {
  return m.korTeam.includes(keyword) || m.competition.includes(keyword);
}

// ─────────────────────────────────────────────
// 선수단 정보
// ─────────────────────────────────────────────

export interface KFAPlayer {
  id: string;
  nameKo: string;
  nameEn: string;
  position: string;
  positionKo: string;
  birth: string;
  height: string;
  weight: string;
  club: string;
  photo: string;
}

export async function getKFASquad(kfaAct: string): Promise<KFAPlayer[]> {
  const url = `${KFA_BASE}/national/?act=${kfaAct}`;
  const res = await fetch(url, { headers: HEADERS, next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`KFA squad fetch error: ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const players: KFAPlayer[] = [];

  // 선수 카드: <a onclick="view_player('{id}')"> 내부
  $("a[onclick*='view_player']").each((_, el) => {
    const card = $(el);

    // ID
    const onclickVal = card.attr("onclick") || "";
    const idMatch = onclickVal.match(/view_player\('(\d+)'\)/);
    const playerId = idMatch?.[1] || "";

    // 사진
    const picEl = card.find(".pic");
    const styleVal = picEl.attr("style") || "";
    const photoMatch = styleVal.match(/url\('([^']+)'\)/);
    const photo = photoMatch?.[1] || "";

    // 이름
    const nameEl = card.find(".name");
    const nameHtml = nameEl.html() || "";
    const nameParts = nameHtml.split(/<br\s*\/?>/i);
    const nameKo = stripHtml(nameParts[0] || "");
    const nameEn = stripHtml(nameParts[1] || "");

    // 프로필 (생년월일 / 신장·체중 / 소속팀)
    const profileEl = card.find(".profile");
    const profileHtml = profileEl.html() || "";
    const profileParts = profileHtml.split(/<br\s*\/?>/i).map(stripHtml).filter(Boolean);
    const birth = profileParts[0] || "";
    const heightWeight = profileParts[1] || "";
    const [height, weight] = heightWeight.split("/").map((s) => s.trim());
    const club = profileParts[2] || "";

    // 포지션
    const posEl = card.find(".position");
    const posClass = (posEl.attr("class") || "").replace("position", "").trim().toLowerCase();
    const positionKo = POSITION_KO[posClass] || posClass.toUpperCase();

    if (!nameKo) return;

    players.push({
      id: playerId,
      nameKo,
      nameEn,
      position: posClass.toUpperCase(),
      positionKo,
      birth,
      height: height || "",
      weight: weight || "",
      club,
      photo,
    });
  });

  return players;
}
