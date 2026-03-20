import Link from "next/link";
import Image from "next/image";
import { KOREA_TEAMS } from "@/data/teams";
import { Team, Match } from "@/types/football";
import { getFixtures, getHighlights, Highlight } from "@/lib/api";

const CATEGORY_LABEL: Record<string, string> = {
  senior: "성인",
  u23: "U-23",
  u20: "U-20",
  u17: "U-17",
};

const FINISHED = ["FT", "AET", "PEN"];

function MatchRow({ match, teamId, label }: { match: Match | null; teamId: number; label: string }) {
  if (!match) {
    return (
      <div className="flex items-center gap-2 text-xs py-1.5 text-gray-400">
        <span className="w-8 flex-shrink-0 font-medium">{label}</span>
        <span>일정 없음</span>
      </div>
    );
  }

  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const isFinished = FINISHED.includes(match.status.short);
  const date = new Date(match.date);
  const won = isHome ? match.homeTeam.winner : match.awayTeam.winner;

  return (
    <Link href={`/matches/${match.id}`} className="flex items-center gap-2 text-xs py-1.5 hover:bg-gray-50 rounded-lg px-1 -mx-1 transition-colors group/row">
      <span className="w-8 flex-shrink-0 font-medium text-gray-500">{label}</span>
      <Image src={opponent.logo} alt={opponent.name} width={16} height={16} unoptimized className="flex-shrink-0" />
      <span className="text-gray-600 truncate flex-1 group-hover/row:text-blue-600">
        {isHome ? "홈" : "원정"} · {opponent.name}
      </span>
      <span className="flex-shrink-0 font-semibold">
        {isFinished ? (
          <span className={won === true ? "text-blue-600" : won === false ? "text-red-500" : "text-gray-600"}>
            {match.score.home} : {match.score.away}
          </span>
        ) : (
          <span className="text-gray-500">
            {date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
          </span>
        )}
      </span>
    </Link>
  );
}

function TeamCard({
  team, lastMatch, nextMatch, highlights,
}: {
  team: Team;
  lastMatch: Match | null;
  nextMatch: Match | null;
  highlights: Highlight[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all overflow-hidden">
      {/* 팀 헤더 */}
      <Link href={`/teams/${team.id}`} className="block p-5 group">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <Image src={team.logo} alt={team.nameKo} fill className="object-contain" unoptimized />
          </div>
          <div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-1 inline-block ${
              team.gender === "male" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
            }`}>
              {team.gender === "male" ? "남자" : "여자"} · {CATEGORY_LABEL[team.category]}
            </span>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">
              {team.nameKo}
            </h3>
          </div>
        </div>
      </Link>

      {/* 경기 일정 */}
      <div className="border-t border-gray-50 px-5 pb-3 pt-2">
        <MatchRow match={lastMatch} teamId={team.id} label="최근" />
        <MatchRow match={nextMatch} teamId={team.id} label="다음" />
      </div>

      {/* 하이라이트 섬네일 2개 */}
      {highlights.length > 0 && (
        <div className="border-t border-gray-50 px-4 pb-4 pt-3">
          <p className="text-xs font-semibold text-gray-400 mb-2">🎬 최근 하이라이트</p>
          <div className="grid grid-cols-2 gap-2">
            {highlights.slice(0, 2).map((h) => (
              <a
                key={h.id}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/hl rounded-lg overflow-hidden border border-gray-100 hover:border-red-300 hover:shadow-sm transition-all"
              >
                <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={h.thumb}
                    alt={h.title}
                    className="w-full h-full object-cover group-hover/hl:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/hl:bg-black/35 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center shadow">
                      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="px-1.5 py-1.5">
                  <p className="text-[10px] text-gray-600 line-clamp-2 leading-tight group-hover/hl:text-red-600 transition-colors">
                    {h.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function HomePage() {
  // 모든 팀의 경기 일정 + 하이라이트를 병렬로 조회
  const [fixturesPerTeam, highlightsPerTeam] = await Promise.all([
    Promise.all(
      KOREA_TEAMS.map((team) => getFixtures(team.id, 2024).catch(() => [] as Match[]))
    ),
    Promise.all(
      KOREA_TEAMS.map((team) => getHighlights(team.highlightQuery, 2).catch(() => [] as Highlight[]))
    ),
  ]);

  const maleTeams = KOREA_TEAMS.filter((t) => t.gender === "male");
  const femaleTeams = KOREA_TEAMS.filter((t) => t.gender === "female");

  function getTeamData(team: Team) {
    const idx = KOREA_TEAMS.indexOf(team);
    const fixtures = fixturesPerTeam[idx] ?? [];
    const highlights = highlightsPerTeam[idx] ?? [];

    const lastMatch = fixtures
      .filter((m) => FINISHED.includes(m.status.short))
      .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;

    const nextMatch = fixtures
      .filter((m) => !FINISHED.includes(m.status.short))
      .sort((a, b) => a.timestamp - b.timestamp)[0] ?? null;

    return { lastMatch, nextMatch, highlights };
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#C41E3A] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="https://media.api-sports.io/football/teams/10177.png"
              alt="대한민국 축구 대표팀 엠블럼"
              width={80}
              height={80}
              unoptimized
              className="drop-shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-extrabold mb-1">대한민국 축구 대표팀</h1>
          <p className="text-red-100 text-sm">선수단 · 일정 · 결과</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            남자 대표팀
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {maleTeams.map((team) => {
              const { lastMatch, nextMatch, highlights } = getTeamData(team);
              return <TeamCard key={team.id} team={team} lastMatch={lastMatch} nextMatch={nextMatch} highlights={highlights} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-pink-500 rounded-full inline-block" />
            여자 대표팀
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {femaleTeams.map((team) => {
              const { lastMatch, nextMatch, highlights } = getTeamData(team);
              return <TeamCard key={team.id} team={team} lastMatch={lastMatch} nextMatch={nextMatch} highlights={highlights} />;
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
