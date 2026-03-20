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

// 선수명 한글 매핑 (국가대표 선수 전체)
export const PLAYER_NAME_MAP: Record<string, string> = {
  // ===== 남자 성인 대표팀 =====
  // 골키퍼
  "Kim Seung-Gyu": "김승규",
  "Seung-Gyu Kim": "김승규",
  "Jo Hyeon-Woo": "조현우",
  "Hyeon-Woo Jo": "조현우",
  "Gu Sung-Yun": "구성윤",
  "Kim Jung-Hoon": "김정훈",
  "Lee Chang-Geun": "이창근",
  "Jeong Sanhoon": "정산훈",
  "Yang Hyeon-Jun": "양현준",

  // 수비수
  "Kim Min-Jae": "김민재",
  "Min-Jae Kim": "김민재",
  "Kim Young-Gwon": "김영권",
  "Young-Gwon Kim": "김영권",
  "Kim Jin-Su": "김진수",
  "Jin-Su Kim": "김진수",
  "Lee Ki-Je": "이기제",
  "Ki-Je Lee": "이기제",
  "Hong Chul": "홍철",
  "Chul Hong": "홍철",
  "Seol Young-Woo": "설영우",
  "Young-Woo Seol": "설영우",
  "Kim Tae-Hwan": "김태환",
  "Tae-Hwan Kim": "김태환",
  "Park Kyung-Won": "박경원",
  "Kyung-Won Park": "박경원",
  "Jo Yu-Min": "조유민",
  "Yu-Min Jo": "조유민",
  "Kwon Kyung-Won": "권경원",
  "Kyung-Won Kwon": "권경원",
  "Lee Yong": "이용",
  "Yong Lee": "이용",
  "Lee Jae-Ik": "이재익",
  "Choi Jun": "최준",
  "Hwang Hyeon-Su": "황현수",
  "Park Seung-Wook": "박승욱",
  "Oh Ban-Suk": "오반석",
  "Ban-Suk Oh": "오반석",
  "Kim Moon-Hwan": "김문환",
  "Moon-Hwan Kim": "김문환",
  "Kim Ju-Sung": "김주성",

  // 미드필더
  "Hwang In-Beom": "황인범",
  "In-Beom Hwang": "황인범",
  "Lee Jae-Sung": "이재성",
  "Jae-Sung Lee": "이재성",
  "Lee Kang-In": "이강인",
  "Kang-In Lee": "이강인",
  "Paik Seung-Ho": "백승호",
  "Seung-Ho Paik": "백승호",
  "Kwon Chang-Hoon": "권창훈",
  "Chang-Hoon Kwon": "권창훈",
  "Na Sang-Ho": "나상호",
  "Sang-Ho Na": "나상호",
  "Son Jun-Ho": "손준호",
  "Jun-Ho Son": "손준호",
  "Son Junho": "손준호",
  "Jung Woo-Young": "정우영",
  "Woo-Young Jung": "정우영",
  "Jeong Woo-Yeong": "정우영",
  "Park Yong-Woo": "박용우",
  "Yong-Woo Park": "박용우",
  "Won Du-Jae": "원두재",
  "Du-Jae Won": "원두재",
  "Lee Soon-Min": "이순민",
  "Soon-Min Lee": "이순민",
  "Jeong Sang-Bin": "정상빈",
  "Sang-Bin Jeong": "정상빈",
  "Kim Bo-Kyung": "김보경",
  "Bo-Kyung Kim": "김보경",
  "Lee Sang-Hyeob": "이상협",
  "Cho Young-Wook": "조영욱",
  "Young-Wook Cho": "조영욱",
  "Lim Chang-Woo": "임창우",
  "Chang-Woo Lim": "임창우",
  "Park Gyu-Hyun": "박규현",
  "Gyu-Hyun Park": "박규현",
  "Yang Hyun-Jun": "양현준",

  // 공격수
  "Son Heung-Min": "손흥민",
  "Heung-Min Son": "손흥민",
  "Hwang Hee-Chan": "황희찬",
  "Hee-Chan Hwang": "황희찬",
  "Cho Gue-Sung": "조규성",
  "Gue-Sung Cho": "조규성",
  "Oh Hyeon-Gyu": "오현규",
  "Oh Hyeon-gyu": "오현규",
  "Hyeon-Gyu Oh": "오현규",
  "Hwang Ui-Jo": "황의조",
  "Ui-Jo Hwang": "황의조",
  "Lim Sang-Hyeop": "임상협",
  "Sang-Hyeop Lim": "임상협",
  "Eom Won-Sang": "엄원상",
  "Won-Sang Eom": "엄원상",
  "Lee Seung-Woo": "이승우",
  "Seung-Woo Lee": "이승우",
  "Go Mu-Yeol": "고무열",

  // ===== U-23 대표팀 =====
  "Lee Jun-Seok": "이준석",
  "Jun-Seok Lee": "이준석",
  "Park Tae-Jun": "박태준",
  "Tae-Jun Park": "박태준",
  "Hong Hyeon-Seok": "홍현석",
  "Hyeon-Seok Hong": "홍현석",
  "Oh Se-Hun": "오세훈",
  "Se-Hun Oh": "오세훈",
  "Ko Young-Jun": "고영준",
  "Young-Jun Ko": "고영준",
  "Lee Dong-Jun": "이동준",
  "Dong-Jun Lee": "이동준",
  "Park Chang-Woo": "박창우",
  "Chang-Woo Park": "박창우",
  "Kang Sang-Yoon": "강상윤",
  "Sang-Yoon Kang": "강상윤",
  "Lee Tae-Seok": "이태석",
  "Tae-Seok Lee": "이태석",
  "Kang Hyeon-Muk": "강현묵",
  "Hyeon-Muk Kang": "강현묵",
  "Choi Seok-Hyun": "최석현",
  "Seok-Hyun Choi": "최석현",
  "Bae Jun-Ho": "배준호",
  "Jun-Ho Bae": "배준호",
  "Hwang Jae-Won": "황재원",
  "Jae-Won Hwang": "황재원",
  "Park Jin-Seop": "박진섭",
  "Jin-Seop Park": "박진섭",
  "Kim Hyun-Woo": "김현우",
  "Hyun-Woo Kim": "김현우",
  "Lee Han-Beom": "이한범",
  "Han-Beom Lee": "이한범",
  "Lee Jae-Won": "이재원",
  "Jae-Won Lee": "이재원",
  "Moon Hyun-Ho": "문현호",
  "Hyun-Ho Moon": "문현호",
  "Cho Young-Hyun": "조영현",
  "Young-Hyun Cho": "조영현",
  "Choi Min-Seo": "최민서",
  "Min-Seo Choi": "최민서",
  "Kim Geon-Hee": "김건희",
  "Geon-Hee Kim": "김건희",
  "Kim Jae-Woo": "김재우",
  "Jae-Woo Kim": "김재우",
  "Lee Seung-Won": "이승원",
  "Seung-Won Lee": "이승원",

  // ===== U-20 대표팀 =====
  "Choi Seung-Hyeon": "최승현",
  "Lee Ji-Hoon": "이지훈",
  "Ji-Hoon Lee": "이지훈",
  "Park Sang-Hyeon": "박상현",
  "Sang-Hyeon Park": "박상현",
  "Kim Dong-Hyun": "김동현",
  "Dong-Hyun Kim": "김동현",
  "Lee Hwan-Seong": "이환성",
  "Hwan-Seong Lee": "이환성",
  "Go Seung-Woon": "고승운",
  "Seung-Woon Go": "고승운",
  "Kim Young-Tak": "김영탁",
  "Young-Tak Kim": "김영탁",
  "Lee Jeong-Min": "이정민",
  "Jeong-Min Lee": "이정민",
  "Kim Ju-Chan": "김주찬",
  "Ju-Chan Kim": "김주찬",
  "Cho Hyeon-Woo": "조현우",
  "Park Min-Gyu": "박민규",
  "Min-Gyu Park": "박민규",
  "Lim Hyeon-Jun": "임현준",
  "Hyeon-Jun Lim": "임현준",
  "Lee Ui-Hyeon": "이의현",
  "Ui-Hyeon Lee": "이의현",
  "Seo Min-Kyu": "서민규",
  "Min-Kyu Seo": "서민규",
  "Kim Kyung-Min": "김경민",
  "Kyung-Min Kim": "김경민",

  // ===== U-17 대표팀 =====
  "Bae Byeong-Jun": "배병준",
  "Byeong-Jun Bae": "배병준",
  "Lee Ji-Won": "이지원",
  "Ji-Won Lee": "이지원",
  "Choi Yun-Seok": "최윤석",
  "Yun-Seok Choi": "최윤석",
  "Kim Jun-Seo": "김준서",
  "Jun-Seo Kim": "김준서",
  "Oh Jae-Hyeok": "오재혁",
  "Jae-Hyeok Oh": "오재혁",
  "Yang Min-Hyeok": "양민혁",
  "Min-Hyeok Yang": "양민혁",
  "Shin Beom-Soo": "신범수",
  "Beom-Soo Shin": "신범수",
  "Ha Seong-Min": "하성민",
  "Seong-Min Ha": "하성민",
  "Park Ji-Hwan": "박지환",
  "Ji-Hwan Park": "박지환",
  "Ye-Geon Kim": "김예건",
  "Ye-geon Kim": "김예건",
  "Kim Ye-Geon": "김예건",
  "Park Sung-Hyeon": "박성현",

  // ===== 여자 성인 대표팀 =====
  "Ji So-Yun": "지소연",
  "So-Yun Ji": "지소연",
  "Kim Hye-Ri": "김혜리",
  "Hye-Ri Kim": "김혜리",
  "Cho So-Hyun": "조소현",
  "So-Hyun Cho": "조소현",
  "Lee Min-A": "이민아",
  "Min-A Lee": "이민아",
  "Choe Yu-Ri": "최유리",
  "Yu-Ri Choe": "최유리",
  "Lee Geum-Min": "이금민",
  "Geum-Min Lee": "이금민",
  "Casey Phair": "케이시 페어",
  "Park Eun-Sun": "박은선",
  "Eun-Sun Park": "박은선",
  "Kang Chae-Rim": "강채림",
  "Chae-Rim Kang": "강채림",
  "Yoo Young-A": "유영아",
  "Young-A Yoo": "유영아",
  "Shim Seo-Yeon": "심서연",
  "Seo-Yeon Shim": "심서연",
  "Kim Jung-Mi": "김정미",
  "Jung-Mi Kim": "김정미",
  "Oh Ji-Yeon": "오지연",
  "Ji-Yeon Oh": "오지연",
  "Bae Ji-Young": "배지영",
  "Ji-Young Bae": "배지영",
  "Park Hye-Ji": "박혜지",
  "Hye-Ji Park": "박혜지",
  "Son Hwa-Yeon": "손화연",
  "Hwa-Yeon Son": "손화연",
  "Lee Young-Ju": "이영주",
  "Young-Ju Lee": "이영주",
  "Chung Seol-Bin": "정설빈",
  "Seol-Bin Chung": "정설빈",

  // ===== 여자 U-20 대표팀 =====
  "Chun Ga-Ram": "천가람",
  "Ga-Ram Chun": "천가람",
  "Han Yoon-Ah": "한윤아",
  "Yoon-Ah Han": "한윤아",
  "Kim Ji-Yeon": "김지연",
  "Ji-Yeon Kim": "김지연",
  "Park Ji-Su": "박지수",
  "Ji-Su Park": "박지수",
  "Lee Ye-Bin": "이예빈",
  "Ye-Bin Lee": "이예빈",
  "Kim Se-Eun": "김세은",
  "Se-Eun Kim": "김세은",
};

export function translatePlayerName(name: string): string {
  return PLAYER_NAME_MAP[name] ?? name;
}
