import { Team } from "@/types/football";

export const KOREA_TEAMS: Team[] = [
  {
    id: 17,
    name: "South Korea",
    nameKo: "대한민국 남자 축구 국가대표팀",
    code: "KOR",
    category: "senior",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/17.png",
    highlightQuery: "대한민국 축구 국가대표 하이라이트",
  },
  {
    id: 10177,
    name: "Korea Republic U23",
    nameKo: "대한민국 U-23 남자 축구 국가대표팀",
    code: "KOR",
    category: "u23",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/10177.png",
    highlightQuery: "대한민국 U23 축구 하이라이트",
  },
  {
    id: 10291,
    name: "Korea Republic U20",
    nameKo: "대한민국 U-20 남자 축구 국가대표팀",
    code: "KOR",
    category: "u20",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/10291.png",
    highlightQuery: "대한민국 U20 축구 하이라이트",
  },
  {
    id: 12512,
    name: "Korea Republic U17",
    nameKo: "대한민국 U-17 남자 축구 국가대표팀",
    code: "KOR",
    category: "u17",
    gender: "male",
    logo: "https://media.api-sports.io/football/teams/12512.png",
    highlightQuery: "대한민국 U17 축구 하이라이트",
  },
  {
    id: 1728,
    name: "South Korea W",
    nameKo: "대한민국 여자 축구 국가대표팀",
    code: "KOR",
    category: "senior",
    gender: "female",
    logo: "https://media.api-sports.io/football/teams/1728.png",
    highlightQuery: "대한민국 여자 축구 국가대표 하이라이트",
  },
  {
    id: 19087,
    name: "Korea Republic U20 W",
    nameKo: "대한민국 U-20 여자 축구 국가대표팀",
    code: "KOR",
    category: "u20",
    gender: "female",
    logo: "https://media.api-sports.io/football/teams/19087.png",
    highlightQuery: "대한민국 U20 여자 축구 하이라이트",
  },
];

export function getTeamById(id: number): Team | undefined {
  return KOREA_TEAMS.find((t) => t.id === id);
}
