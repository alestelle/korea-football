import { Team } from "@/types/football";

export const KOREA_TEAMS: Team[] = [
  {
    id: 732,
    name: "South Korea",
    nameKo: "대한민국 남자 축구 국가대표팀",
    code: "KOR",
    category: "senior",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/732.png",
  },
  {
    id: 2364,
    name: "South Korea U23",
    nameKo: "대한민국 U-23 남자 축구 국가대표팀",
    code: "KOR",
    category: "u23",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/2364.png",
  },
  {
    id: 2363,
    name: "South Korea U20",
    nameKo: "대한민국 U-20 남자 축구 국가대표팀",
    code: "KOR",
    category: "u20",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/2363.png",
  },
  {
    id: 2365,
    name: "South Korea U17",
    nameKo: "대한민국 U-17 남자 축구 국가대표팀",
    code: "KOR",
    category: "u17",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/2365.png",
  },
  {
    id: 3377,
    name: "South Korea W",
    nameKo: "대한민국 여자 축구 국가대표팀",
    code: "KOR",
    category: "senior",
    gender: "female",
    logo: "https://media.api-sports.io/football/teams/3377.png",
  },
  {
    id: 4311,
    name: "South Korea U20 W",
    nameKo: "대한민국 U-20 여자 축구 국가대표팀",
    code: "KOR",
    category: "u20",
    gender: "female",
    logo: "https://media.api-sports.io/football/teams/4311.png",
  },
];

export function getTeamById(id: number): Team | undefined {
  return KOREA_TEAMS.find((t) => t.id === id);
}
