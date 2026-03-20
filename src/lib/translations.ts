// 포지션 번역
export const POSITION_MAP: Record<string, string> = {
  Goalkeeper: "골키퍼",
  Defender: "수비수",
  Midfielder: "미드필더",
  Attacker: "공격수",
  Forward: "공격수",
  "G": "골키퍼",
  "D": "수비수",
  "M": "미드필더",
  "F": "공격수",
};

// 국적 번역
export const NATIONALITY_MAP: Record<string, string> = {
  "South Korea": "대한민국",
  Korea: "대한민국",
  "South Korea Republic": "대한민국",
  Brazil: "브라질",
  Germany: "독일",
  France: "프랑스",
  Spain: "스페인",
  Portugal: "포르투갈",
  England: "잉글랜드",
  Italy: "이탈리아",
  Netherlands: "네덜란드",
  Argentina: "아르헨티나",
  Uruguay: "우루과이",
  Japan: "일본",
  China: "중국",
  Australia: "호주",
  "United States": "미국",
  Norway: "노르웨이",
  Sweden: "스웨덴",
  Denmark: "덴마크",
};

// 경기 상태 번역
export const STATUS_MAP: Record<string, string> = {
  TBD: "일정 미정",
  NS: "예정",
  "1H": "전반전",
  HT: "하프타임",
  "2H": "후반전",
  ET: "연장전",
  P: "승부차기",
  FT: "종료",
  AET: "연장 종료",
  PEN: "승부차기 종료",
  BT: "휴식",
  SUSP: "중단",
  INT: "일시중단",
  PST: "연기",
  CANC: "취소",
  ABD: "중단",
  AWD: "몰수패",
  WO: "부전패",
  LIVE: "진행중",
};

// 이벤트 타입 번역
export const EVENT_TYPE_MAP: Record<string, string> = {
  Goal: "골",
  "Own Goal": "자책골",
  "Penalty": "페널티킥",
  "Missed Penalty": "페널티킥 실축",
  Card: "카드",
  "Yellow Card": "경고",
  "Red Card": "퇴장",
  "Yellow Red Card": "두 번째 경고",
  subst: "교체",
  Substitution: "교체",
  Var: "VAR",
};

// 코치 역할 번역
export const COACH_ROLE_MAP: Record<string, string> = {
  "Head Coach": "감독",
  Coach: "코치",
  "Assistant Coach": "수석 코치",
  "Goalkeeper Coach": "골키퍼 코치",
  "Fitness Coach": "피지컬 코치",
};

// 대회명 번역
export const LEAGUE_MAP: Record<string, string> = {
  "World Cup": "FIFA 월드컵",
  "World Cup - Qualification Asia": "FIFA 월드컵 아시아 예선",
  "Asian Cup": "AFC 아시안컵",
  "Asian Cup - Qualification": "AFC 아시안컵 예선",
  "Olympics": "올림픽",
  "Friendly": "친선경기",
  "International Champions Cup": "국제 챔피언스컵",
  "East Asian Football Championship": "동아시안컵",
  "AFC U23 Asian Cup": "AFC U-23 아시안컵",
  "AFC U20 Asian Cup": "AFC U-20 아시안컵",
  "AFC U17 Asian Cup": "AFC U-17 아시안컵",
};

export function translatePosition(pos: string): string {
  return POSITION_MAP[pos] ?? pos;
}

export function translateNationality(nat: string): string {
  return NATIONALITY_MAP[nat] ?? nat;
}

export function translateStatus(status: string): string {
  return STATUS_MAP[status] ?? status;
}

export function translateLeague(name: string): string {
  return LEAGUE_MAP[name] ?? name;
}

export function translateCoachRole(role: string): string {
  return COACH_ROLE_MAP[role] ?? role;
}

export function translateEventType(type: string, detail: string): string {
  if (type === "Card") {
    return EVENT_TYPE_MAP[detail] ?? detail;
  }
  if (type === "subst" || type === "Substitution") return "교체";
  return EVENT_TYPE_MAP[type] ?? type;
}

// 선수명 한글 매핑 (주요 선수)
export const PLAYER_NAME_MAP: Record<string, string> = {
  // 골키퍼
  "Seung-Gyu Kim": "김승규",
  "Jo Hyeon-Woo": "조현우",
  "Kim Seung-Gyu": "김승규",

  // 수비수
  "Kim Min-Jae": "김민재",
  "Kim Young-Gwon": "김영권",
  "Kim Jin-Su": "김진수",
  "Lee Ki-Je": "이기제",
  "Oh Hyeon-Gyu": "오현규",
  "Hong Chul": "홍철",
  "Park Hyun-Beom": "박현범",
  "Seol Young-Woo": "설영우",

  // 미드필더
  "Jung Woo-Young": "정우영",
  "Hwang In-Beom": "황인범",
  "Son Junho": "손준호",
  "Lee Jae-Sung": "이재성",
  "Lee Kang-In": "이강인",
  "Paik Seung-Ho": "백승호",
  "Kwon Chang-Hoon": "권창훈",
  "Na Sang-Ho": "나상호",
  "Jeong Sang-Bin": "정상빈",

  // 공격수
  "Son Heung-Min": "손흥민",
  "Hwang Hee-Chan": "황희찬",
  "Cho Gue-Sung": "조규성",
  "Oh Hyeon-gyu": "오현규",
  "Hwang Ui-Jo": "황의조",
  "Lim Sang-Hyeop": "임상협",
  "Jeong Woo-Yeong": "정우영",
};

export function translatePlayerName(name: string): string {
  return PLAYER_NAME_MAP[name] ?? name;
}
