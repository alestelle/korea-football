/**
 * 네이버 스포츠 경기 데이터 스크래퍼
 * - 경기별 Naver Sports URL 조회
 * - 한줄평 베스트 3개 조회
 */
import * as cheerio from "cheerio";
import { getNaverGameUrl } from "@/data/naver-game-codes";

export interface OnelineComment {
  text: string;
  author: string;
  likes: number;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

const API_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Accept: "application/json, text/plain, */*",
  Referer: "https://m.sports.naver.com/",
};

// game ID 정규식: 알파벳+숫자 8자 이상
const GAME_ID_RE = /sports\.naver\.com\/game\/([A-Za-z0-9]{8,})/g;

function extractGameId(text: string): string | null {
  GAME_ID_RE.lastIndex = 0;
  const m = GAME_ID_RE.exec(text);
  return m ? m[1] : null;
}

function toDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return { dateStr: `${y}${m}${d}`, monthStr: `${y}${m}`, y, m, d };
}

/** JSON 내 특정 키를 재귀 탐색 */
function findKey(obj: unknown, key: string, depth = 0): unknown {
  if (depth > 10 || !obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const r = findKey(item, key, depth + 1);
      if (r !== null) return r;
    }
    return null;
  }
  const rec = obj as Record<string, unknown>;
  if (key in rec) return rec[key];
  for (const val of Object.values(rec)) {
    const r = findKey(val, key, depth + 1);
    if (r !== null) return r;
  }
  return null;
}

/**
 * Naver Sports 페이지 HTML의 __NEXT_DATA__ 또는 embedded JSON에서
 * 대한민국 경기의 game 코드를 추출합니다.
 */
function extractGameIdFromPageData(html: string, dateStr: string, opponent?: string): string | null {
  // 1) __NEXT_DATA__ JSON
  const nextDataMatch = html.match(
    /<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]+?)<\/script>/
  );
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const gameId = findGameCodeInData(data, dateStr, opponent);
      if (gameId) return gameId;
    } catch { /* continue */ }
  }

  // 2) window.__INITIAL_STATE__ 등 embedded JSON
  const statePatterns = [
    /window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]+?\});\s*(?:<\/script>|window\.)/,
    /window\.__APP_DATA__\s*=\s*(\{[\s\S]+?\});\s*(?:<\/script>|window\.)/,
  ];
  for (const pat of statePatterns) {
    const m = html.match(pat);
    if (m) {
      try {
        const data = JSON.parse(m[1]);
        const gameId = findGameCodeInData(data, dateStr, opponent);
        if (gameId) return gameId;
      } catch { /* continue */ }
    }
  }

  // 3) 전체 HTML에서 바로 game URL 스캔 (날짜 컨텍스트 근처)
  return extractGameId(html);
}

/**
 * JSON 데이터 트리에서 대한민국 경기의 gameCode를 찾습니다.
 * dateStr + opponent 로 매칭. opponent 없으면 날짜만 매칭.
 */
function findGameCodeInData(
  data: unknown,
  dateStr?: string,
  opponent?: string
): string | null {
  const listKeys = ["gameList", "games", "scheduleList", "gameSchedule", "items", "list"];
  for (const key of listKeys) {
    const list = findKey(data, key);
    if (Array.isArray(list)) {
      for (const game of list as Record<string, unknown>[]) {
        const homeTeam = String(game.homeTeamName ?? game.homeTeam ?? "");
        const awayTeam = String(game.awayTeamName ?? game.awayTeam ?? "");
        const homeCode = String(game.homeTeamCode ?? "").toUpperCase();
        const awayCode = String(game.awayTeamCode ?? "").toUpperCase();

        const isKor =
          homeCode.includes("KOR") || awayCode.includes("KOR") ||
          homeTeam.includes("한국") || awayTeam.includes("한국") ||
          homeTeam.toLowerCase().includes("korea") ||
          awayTeam.toLowerCase().includes("korea");

        if (!isKor) continue;

        // 날짜 매칭
        if (dateStr) {
          const gameDate = String(
            game.gameDate ?? game.date ?? game.startDate ?? game.gameStartTime ?? ""
          ).replace(/\D/g, "").slice(0, 8);
          if (gameDate && !gameDate.startsWith(dateStr)) continue;
        }

        // 상대팀 이름 매칭 (있으면 추가 검증)
        if (opponent) {
          const oppLower = opponent.toLowerCase();
          const nonKorTeam = homeCode.includes("KOR") ? awayTeam : homeTeam;
          const nameMatch =
            nonKorTeam.toLowerCase().includes(oppLower) ||
            oppLower.includes(nonKorTeam.toLowerCase().slice(0, 2));
          // 이름 매칭 실패해도 날짜가 맞으면 허용 (한국어↔영어 불일치 대비)
          if (!nameMatch && dateStr) {/* 날짜 매칭만으로 진행 */}
        }

        const gameCode = String(
          game.gameCode ?? game.gameId ?? game.id ?? ""
        );
        if (gameCode && gameCode.length >= 8) return gameCode;
      }
    }
  }
  return null;
}

/**
 * 방법 A: Naver Sports 한국축구 일정 페이지에서 game 코드 추출
 * https://m.sports.naver.com/kfootball/schedule/
 */
async function tryNaverKfootballSchedule(opponent: string, date: Date): Promise<string | null> {
  const { dateStr, monthStr } = toDateStr(date);

  const urls = [
    `https://m.sports.naver.com/kfootball/schedule/?month=${monthStr}`,
    `https://m.sports.naver.com/kfootball/schedule/`,
    `https://m.sports.naver.com/soccer/schedule/nationalTeam?date=${dateStr}`,
    `https://m.sports.naver.com/soccer/schedule/nationalTeam?month=${monthStr}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: HEADERS,
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const gameId = extractGameIdFromPageData(html, dateStr, opponent);
      if (gameId) return gameId;
    } catch { /* continue */ }
  }
  return null;
}

/**
 * 방법 B: Naver Sports schedule API (JSON)
 */
async function tryNaverSportsApi(date: Date): Promise<string | null> {
  const { dateStr, monthStr } = toDateStr(date);

  const endpoints = [
    `https://api-gw.sports.naver.com/schedule/games?category=soccer&date=${dateStr}&teamCode=KOR`,
    `https://api-gw.sports.naver.com/schedule/games?category=soccer&date=${dateStr}`,
    `https://api-gw.sports.naver.com/schedule/games?category=soccer&fromDate=${dateStr}&toDate=${dateStr}`,
    `https://api-gw.sports.naver.com/schedule/games?category=soccer&month=${monthStr}&teamCode=KOR`,
    `https://api-gw.sports.naver.com/soccer/schedule/nationalTeam?date=${dateStr}`,
    `https://api-gw.sports.naver.com/soccer/schedule?date=${dateStr}&teamCode=KOR`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: API_HEADERS,
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      const gameId = findGameCodeInData(json, dateStr);
      if (gameId) return gameId;
    } catch { /* continue */ }
  }
  return null;
}

/**
 * 방법 C: Naver 검색 결과에서 game URL 추출
 */
async function tryNaverSearch(opponent: string, date: Date): Promise<string | null> {
  const { y, m, d } = toDateStr(date);

  const queries = [
    `대한민국 ${opponent} 축구 ${y}년 ${m}월${d}일`,
    `한국 ${opponent} 축구 ${y} ${m}월 ${d}일`,
    `대한민국 ${opponent} ${y}년 ${Number(m)}월 ${Number(d)}일`,
  ];

  for (const query of queries) {
    for (const base of [
      "https://search.naver.com/search.naver?where=nexearch&query=",
      "https://m.search.naver.com/search.naver?query=",
      "https://search.naver.com/search.naver?query=",
    ]) {
      try {
        const res = await fetch(`${base}${encodeURIComponent(query)}`, {
          headers: HEADERS,
          next: { revalidate: 3600 },
        });
        if (!res.ok) continue;
        const html = await res.text();

        // 속성 스캔
        const $ = cheerio.load(html);
        let gameId: string | null = null;
        $(
          "a[href], [data-url], [data-href], [data-game-id], [data-gameid], [data-game-code]"
        ).each((_, el) => {
          if (gameId) return false;
          const attrs = [
            $(el).attr("href") ?? "",
            $(el).attr("data-url") ?? "",
            $(el).attr("data-href") ?? "",
            $(el).attr("data-game-id") ?? "",
            $(el).attr("data-gameid") ?? "",
            $(el).attr("data-game-code") ?? "",
          ];
          for (const a of attrs) {
            const id = extractGameId(a);
            if (id) { gameId = id; break; }
          }
        });

        if (!gameId) gameId = extractGameId(html);
        if (gameId) return gameId;
      } catch { /* next */ }
    }
  }
  return null;
}

/**
 * 네이버 스포츠 경기 URL 탐색
 * 0) 수동 등록 game 코드 우선 조회
 * 그 다음 A→B→C 자동 탐색
 */
export async function findNaverSportsGameUrl(
  opponent: string,
  date: Date
): Promise<string | null> {
  const build = (id: string) =>
    `https://m.sports.naver.com/game/${id}/video`;

  // 0) 수동 등록된 코드 우선
  const manual = getNaverGameUrl(date, opponent);
  if (manual) return manual;

  // 1~3) 자동 탐색
  const id =
    (await tryNaverKfootballSchedule(opponent, date)) ??
    (await tryNaverSportsApi(date)) ??
    (await tryNaverSearch(opponent, date));

  return id ? build(id) : null;
}

/**
 * Naver Sports 공개 한줄평 API (베스트 최대 limit개)
 */
export async function getNaverSportsOneline(
  gameId: string,
  limit = 3
): Promise<OnelineComment[]> {
  try {
    const apiUrl = `https://api-gw.sports.naver.com/sports/oneline/list?gameCode=${gameId}&type=BEST&limit=${limit}`;
    const res = await fetch(apiUrl, {
      headers: {
        ...API_HEADERS,
        Referer: `https://m.sports.naver.com/game/${gameId}/video`,
      },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const items: Record<string, unknown>[] =
        json?.result?.onelineList ??
        json?.data?.list ??
        json?.onelineList ??
        json?.list ??
        [];
      const mapped = items
        .slice(0, limit)
        .map((item) => ({
          text: String(item.comment ?? item.contents ?? item.text ?? ""),
          author: String(item.nickName ?? item.writer ?? item.author ?? ""),
          likes: Number(item.likeCount ?? item.likes ?? 0),
        }))
        .filter((c) => c.text);
      if (mapped.length > 0) return mapped;
    }
  } catch { /* fall through */ }

  try {
    const pageUrl = `https://m.sports.naver.com/game/${gameId}/video`;
    const res = await fetch(pageUrl, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const patterns = [
      /window\.__APP_INITIAL_DATA__\s*=\s*(\{[\s\S]+?\});\s*<\/script>/,
      /window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]+?\});\s*<\/script>/,
      /"onelineList"\s*:\s*(\[[\s\S]+?\])/,
    ];

    for (const pattern of patterns) {
      const m = html.match(pattern);
      if (!m) continue;
      try {
        const parsed = JSON.parse(m[1]);
        const list = findKey(parsed, "onelineList");
        if (Array.isArray(list) && list.length > 0) {
          return list
            .slice(0, limit)
            .map((item: Record<string, unknown>) => ({
              text: String(item.comment ?? item.contents ?? item.text ?? ""),
              author: String(item.nickName ?? item.writer ?? ""),
              likes: Number(item.likeCount ?? 0),
            }))
            .filter((c) => c.text);
        }
      } catch { /* continue */ }
    }
  } catch { /* fall through */ }

  return [];
}

/**
 * 경기 상대·날짜로 한줄평 + 게임 URL 한 번에 조회
 */
export async function getMatchNaverData(
  opponent: string,
  date: Date
): Promise<{ gameUrl: string | null; comments: OnelineComment[] }> {
  const gameUrl = await findNaverSportsGameUrl(opponent, date);
  if (!gameUrl) return { gameUrl: null, comments: [] };

  const idMatch = gameUrl.match(/game\/([A-Za-z0-9_-]+)/);
  const gameId = idMatch?.[1] ?? "";
  const comments = gameId ? await getNaverSportsOneline(gameId) : [];

  return { gameUrl, comments };
}

/** 게임 URL을 못 찾을 때 Naver 검색으로 폴백 */
export function buildNaverSearchUrl(opponent: string, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const query = `대한민국 ${opponent} 축구 ${year}년 ${month}월${day}일`;
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}
