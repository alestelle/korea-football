export interface Team {
  id: number;
  name: string;
  nameKo: string;
  code: string;
  category: "senior" | "u23" | "u20" | "u17";
  gender: "male" | "female";
  logo: string;
  highlightQuery: string;
  kfaAct: string;           // KFA 선수단 페이지 act 파라미터
  kfaTeamKeyword: string;   // KFA 일정 페이지 팀 이름 키워드
  captainNameKo?: string;   // 팀 주장 이름 (한글)
}

export interface Player {
  id: number;
  name: string;
  nameKo?: string;
  age: number;
  number?: number;
  position: string;
  positionKo: string;
  nationality: string;
  nationalityKo: string;
  photo: string;
  birth?: { date: string; place: string; country: string };
  height?: string;
  weight?: string;
  club?: {
    id: number;
    name: string;
    logo: string;
  };
  statistics?: PlayerStatistics;
}

export interface PlayerStatistics {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export interface Coach {
  id: number;
  name: string;
  nameKo?: string;
  role: string;
  roleKo: string;
  nationality: string;
  nationalityKo: string;
  photo: string;
  age?: number;
}

export interface Match {
  id: number;
  date: string;
  timestamp: number;
  status: {
    short: string;
    long: string;
    longKo: string;
    elapsed?: number;
  };
  league: {
    id: number;
    name: string;
    nameKo?: string;
    logo: string;
    round?: string;
  };
  homeTeam: MatchTeam;
  awayTeam: MatchTeam;
  venue?: { id?: number; name?: string; city?: string };
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface MatchTeam {
  id: number;
  name: string;
  nameKo?: string;
  logo: string;
  winner?: boolean | null;
}

export interface MatchDetail extends Match {
  events?: MatchEvent[];
  lineups?: {
    team: MatchTeam;
    formation?: string;
    startXI: { player: { id: number; name: string; number: number; pos: string } }[];
    substitutes: { player: { id: number; name: string; number: number; pos: string } }[];
  }[];
  statistics?: {
    team: MatchTeam;
    stats: { type: string; value: string | number | null }[];
  }[];
}

export interface MatchEvent {
  time: { elapsed: number; extra?: number };
  team: MatchTeam;
  player: { id: number; name: string };
  assist?: { id: number; name: string };
  type: string;
  detail: string;
}
