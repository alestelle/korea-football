/**
 * 네이버 스포츠 경기 코드 매핑
 * 키 형식: "YYYYMMDD-상대팀영문소문자"
 * 값: https://m.sports.naver.com/game/{코드}/video 의 코드 부분
 *
 * 추가 방법:
 * 1. https://m.sports.naver.com/kfootball/schedule/ 에서 해당 경기 클릭
 * 2. URL에서 /game/{코드}/ 부분의 코드를 복사
 * 3. 아래 형식으로 추가: "YYYYMMDD-상대팀영문소문자": "코드"
 */
export const NAVER_GAME_CODES: Record<string, string> = {
  // 2025 친선경기
  "20251118-ghana": "bFLXftJDhUM2bQL",
};

/**
 * 날짜 + 상대팀 이름으로 네이버 스포츠 경기 URL 조회
 */
export function getNaverGameUrl(date: Date, opponentName: string): string | null {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;

  // 영문 소문자 변환 후 정확히 일치
  const key = `${dateStr}-${opponentName.toLowerCase().replace(/\s+/g, "")}`;
  const code = NAVER_GAME_CODES[key];
  if (code) return `https://m.sports.naver.com/game/${code}/video`;

  // 날짜만 같아도 일치 (상대팀 이름 불일치 대비)
  for (const [k, v] of Object.entries(NAVER_GAME_CODES)) {
    if (k.startsWith(dateStr)) return `https://m.sports.naver.com/game/${v}/video`;
  }

  return null;
}
