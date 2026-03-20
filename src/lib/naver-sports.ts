/**
 * 네이버 스포츠 경기 데이터 스크래퍼
 * - 경기별 Naver Sports URL 조회
 * - 한줄평 베스트 3개 조회
 */
import * as cheerio from "cheerio";

export interface OnelineComment {
  text: string;
  author: string;
  likes: number;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
};

/**
 * 네이버 검색으로 해당 경기의 Naver Sports 게임 URL을 찾습니다.
 * 예) https://m.sports.naver.com/game/bFLXftJDhUM2bQL/video
 */
export async function findNaverSportsGameUrl(
  opponent: string,
  date: Date
): Promise<string | null> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const query = `대한민국 ${opponent} 축구 ${year}년 ${month}월${day}일`;

  try {
    const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    let gameUrl: string | null = null;

    // sports.naver.com/game/{id} 패턴 링크 추출
    $("a").each((_, el) => {
      if (gameUrl) return false;
      const href = $(el).attr("href") || "";
      const m = href.match(/sports\.naver\.com\/game\/([A-Za-z0-9_-]+)/);
      if (m) {
        const id = m[1];
        gameUrl = `https://m.sports.naver.com/game/${id}/video`;
      }
    });

    // 링크가 없으면 HTML 텍스트에서도 탐색
    if (!gameUrl) {
      const raw = html.match(/m\.sports\.naver\.com\/game\/([A-Za-z0-9_-]+)/);
      if (raw) gameUrl = `https://${raw[0]}`;
    }

    return gameUrl;
  } catch {
    return null;
  }
}

/**
 * Naver Sports 공개 한줄평 API (베스트 최대 limit개)
 */
export async function getNaverSportsOneline(
  gameId: string,
  limit = 3
): Promise<OnelineComment[]> {
  // 시도 1: Naver Sports 공개 API
  try {
    const apiUrl = `https://api-gw.sports.naver.com/sports/oneline/list?gameCode=${gameId}&type=BEST&limit=${limit}`;
    const res = await fetch(apiUrl, {
      headers: { ...HEADERS, Referer: `https://m.sports.naver.com/game/${gameId}/video` },
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      // API 응답 구조에 따라 파싱
      const items: Record<string, unknown>[] =
        json?.result?.onelineList ??
        json?.data?.list ??
        json?.onelineList ??
        json?.list ??
        [];
      const mapped = items.slice(0, limit).map((item) => ({
        text: String(item.comment ?? item.contents ?? item.text ?? ""),
        author: String(item.nickName ?? item.writer ?? item.author ?? ""),
        likes: Number(item.likeCount ?? item.likes ?? 0),
      })).filter((c) => c.text);
      if (mapped.length > 0) return mapped;
    }
  } catch { /* fall through */ }

  // 시도 2: 게임 페이지 HTML에서 script 태그 내 임베디드 JSON 탐색
  try {
    const pageUrl = `https://m.sports.naver.com/game/${gameId}/video`;
    const res = await fetch(pageUrl, { headers: HEADERS, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const html = await res.text();

    // __APP_INITIAL_DATA__ 또는 유사 패턴에서 한줄평 데이터 추출
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
          return list.slice(0, limit).map((item: Record<string, unknown>) => ({
            text: String(item.comment ?? item.contents ?? item.text ?? ""),
            author: String(item.nickName ?? item.writer ?? ""),
            likes: Number(item.likeCount ?? 0),
          })).filter((c) => c.text);
        }
      } catch { /* continue */ }
    }
  } catch { /* fall through */ }

  return [];
}

/** JSON 내 특정 키를 재귀 탐색 (depth 제한) */
function findKey(obj: unknown, key: string, depth = 0): unknown {
  if (depth > 8 || !obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findKey(item, key, depth + 1);
      if (found !== null) return found;
    }
    return null;
  }
  const record = obj as Record<string, unknown>;
  if (key in record) return record[key];
  for (const val of Object.values(record)) {
    const found = findKey(val, key, depth + 1);
    if (found !== null) return found;
  }
  return null;
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

/** 게임 URL이 없을 때 Naver 검색으로 폴백 */
export function buildNaverSearchUrl(opponent: string, date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const query = `대한민국 ${opponent} 축구 ${year}년 ${month}월${day}일`;
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}
