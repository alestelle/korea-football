import { Coach, Match, MatchDetail, Player } from "@/types/football";

export interface Highlight {
  id: string;
  title: string;
  thumb: string;
  url: string;
}
import {
  translateLeague,
  translateNationality,
  translatePlayerName,
  translatePosition,
  translateStatus,
  translateCoachRole,
} from "./translations";

const BASE_URL = "https://v3.football.api-sports.io";
const HEADERS = {
  "x-rapidapi-host": "v3.football.api-sports.io",
  "x-rapidapi-key": process.env.API_FOOTBALL_KEY ?? "",
};

async function apiFetch(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: HEADERS,
    next: { revalidate: 3600 }, // 1시간 캐시
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// 팀 선수단 조회
export async function getSquad(teamId: number): Promise<{ players: Player[]; coaches: Coach[] }> {
  const [squadData, coachData] = await Promise.all([
    apiFetch(`/players/squads?team=${teamId}`),
    apiFetch(`/coachs?team=${teamId}`),
  ]);

  const players: Player[] = (squadData.response?.[0]?.players ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    nameKo: translatePlayerName(p.name),
    age: p.age,
    number: p.number,
    position: p.position,
    positionKo: translatePosition(p.position),
    nationality: p.nationality ?? "",
    nationalityKo: translateNationality(p.nationality ?? ""),
    photo: p.photo,
  }));

  const coaches: Coach[] = (coachData.response ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    nameKo: translatePlayerName(c.name),
    age: c.age,
    role: c.career?.[0]?.role ?? "Coach",
    roleKo: translateCoachRole(c.career?.[0]?.role ?? "Coach"),
    nationality: c.nationality ?? "",
    nationalityKo: translateNationality(c.nationality ?? ""),
    photo: c.photo,
  }));

  return { players, coaches };
}

// 선수 상세 정보
export async function getPlayer(playerId: number, teamId: number): Promise<Player | null> {
  const data = await apiFetch(`/players?id=${playerId}&team=${teamId}&season=2024`);
  const p = data.response?.[0];
  if (!p) return null;

  return {
    id: p.player.id,
    name: p.player.name,
    nameKo: translatePlayerName(p.player.name),
    age: p.player.age,
    position: p.statistics?.[0]?.games?.position ?? "",
    positionKo: translatePosition(p.statistics?.[0]?.games?.position ?? ""),
    nationality: p.player.nationality ?? "",
    nationalityKo: translateNationality(p.player.nationality ?? ""),
    photo: p.player.photo,
    birth: p.player.birth,
    height: p.player.height,
    weight: p.player.weight,
    club: p.statistics?.[0]?.team
      ? { id: p.statistics[0].team.id, name: p.statistics[0].team.name, logo: p.statistics[0].team.logo }
      : undefined,
    statistics: {
      appearances: p.statistics?.[0]?.games?.appearences ?? 0,
      goals: p.statistics?.[0]?.goals?.total ?? 0,
      assists: p.statistics?.[0]?.goals?.assists ?? 0,
      yellowCards: p.statistics?.[0]?.cards?.yellow ?? 0,
      redCards: p.statistics?.[0]?.cards?.red ?? 0,
    },
  };
}

// 경기 일정/결과 조회
export async function getFixtures(teamId: number, season: number = 2024): Promise<Match[]> {
  const data = await apiFetch(`/fixtures?team=${teamId}&season=${season}`);
  return (data.response ?? []).map(mapFixture);
}

// 경기 상세
export async function getFixture(fixtureId: number): Promise<MatchDetail | null> {
  const data = await apiFetch(`/fixtures?id=${fixtureId}`);
  const f = data.response?.[0];
  if (!f) return null;

  const base = mapFixture(f);

  const events: MatchDetail["events"] = (f.events ?? []).map((e: any) => ({
    time: e.time,
    team: { id: e.team.id, name: e.team.name, logo: e.team.logo },
    player: e.player,
    assist: e.assist,
    type: e.type,
    detail: e.detail,
  }));

  return { ...base, events };
}

// YouTube 하이라이트 검색
export async function getHighlights(query: string, count = 12): Promise<Highlight[]> {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9",
      },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    // ytInitialData 추출 (중괄호 카운팅으로 정확한 JSON 범위 추출)
    const marker = "var ytInitialData = ";
    const markerIdx = html.indexOf(marker);
    if (markerIdx === -1) return [];

    const jsonStart = html.indexOf("{", markerIdx);
    if (jsonStart === -1) return [];

    let depth = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { jsonEnd = i; break; }
      }
    }
    if (depth !== 0) return [];

    const data = JSON.parse(html.slice(jsonStart, jsonEnd + 1));
    const sectionContents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents ?? [];

    const results: Highlight[] = [];
    for (const section of sectionContents) {
      const items = section?.itemSectionRenderer?.contents ?? [];
      for (const item of items) {
        const vr = item?.videoRenderer;
        if (!vr?.videoId) continue;
        const title = vr.title?.runs?.[0]?.text ?? "";
        // 광고나 관련없는 영상 제외
        if (!title) continue;
        results.push({
          id: vr.videoId,
          title,
          thumb: `https://img.youtube.com/vi/${vr.videoId}/mqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${vr.videoId}`,
        });
        if (results.length >= count) break;
      }
      if (results.length >= count) break;
    }
    return results;
  } catch {
    return [];
  }
}

function mapFixture(f: any): Match {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    timestamp: f.fixture.timestamp,
    status: {
      short: f.fixture.status.short,
      long: f.fixture.status.long,
      longKo: translateStatus(f.fixture.status.short),
      elapsed: f.fixture.status.elapsed,
    },
    league: {
      id: f.league.id,
      name: f.league.name,
      nameKo: translateLeague(f.league.name),
      logo: f.league.logo,
      round: f.league.round,
    },
    homeTeam: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      logo: f.teams.home.logo,
      winner: f.teams.home.winner,
    },
    awayTeam: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      logo: f.teams.away.logo,
      winner: f.teams.away.winner,
    },
    venue: f.fixture.venue,
    score: {
      home: f.goals.home,
      away: f.goals.away,
    },
  };
}
