/**
 * 네이버 카페/커뮤니티 인기글 스크래퍼
 * 경기 관련 커뮤니티 게시글을 검색해 반환합니다.
 */
import * as cheerio from "cheerio";

export interface CommunityPost {
  title: string;
  url: string;
  source: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  Referer: "https://www.naver.com/",
};

/**
 * 경기 검색어로 네이버 카페/커뮤니티 인기글 최대 3개 반환
 */
export async function getMatchCommunityPosts(
  query: string
): Promise<CommunityPost[]> {
  try {
    // sort=0: 관련도순, pd=4: 1년 이내
    const url = `https://search.naver.com/search.naver?where=article&query=${encodeURIComponent(query)}&sort=0&pd=4`;
    const res = await fetch(url, {
      headers: HEADERS,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: CommunityPost[] = [];

    // Naver article search result items (li.bx is the stable container)
    $("li.bx").each((_, el) => {
      if (posts.length >= 3) return false;
      const item = $(el);

      // Title — try multiple selector patterns for resilience
      const titleEl = item
        .find(
          "a.api_txt_lines.total_tit, a[class*='total_tit'], .title_link, .tit_txt a"
        )
        .first();
      const title = titleEl.text().trim();
      const href = titleEl.attr("href") || "";

      // Source (cafe/community name)
      const source = item
        .find(".sub_txt_box a, .source_box a, .cafe_name a, a[class*='name']")
        .first()
        .text()
        .trim();

      if (title && href) {
        posts.push({ title, url: href, source: source || "커뮤니티" });
      }
    });

    return posts;
  } catch {
    return [];
  }
}

/**
 * 경기 정보로 검색어 빌드
 * 예) "대한민국 이란 3월25일 축구"
 */
export function buildMatchQuery(
  opponentName: string,
  matchDate: Date
): string {
  const month = matchDate.getMonth() + 1;
  const day = matchDate.getDate();
  return `대한민국 ${opponentName} ${month}월${day}일 축구`;
}
