import { getSquad, getFixtures } from "@/lib/api";
import { getTeamById } from "@/data/teams";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Player, Coach, Match } from "@/types/football";

export const dynamic = "force-dynamic";

function PlayerCard({ player, teamId }: { player: Player; teamId: number }) {
  return (
    <Link href={`/players/${player.id}?team=${teamId}`}>
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {player.photo ? (
            <Image src={player.photo} alt={player.nameKo ?? player.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {player.nameKo ?? player.name}
          </p>
          <p className="text-xs text-gray-400">{player.positionKo} {player.number ? `· #${player.number}` : ""}</p>
        </div>
      </div>
    </Link>
  );
}

function CoachCard({ coach }: { coach: Coach }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        {coach.photo ? (
          <Image src={coach.photo} alt={coach.nameKo ?? coach.name} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
        )}
      </div>
      <div>
        <p className="font-semibold text-sm text-gray-900">{coach.nameKo ?? coach.name}</p>
        <p className="text-xs text-gray-400">{coach.roleKo} · {coach.nationalityKo}</p>
      </div>
    </div>
  );
}

function MatchRow({ match, teamId }: { match: Match; teamId: number }) {
  const isHome = match.homeTeam.id === teamId;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const koScore = match.score.home !== null
    ? `${match.score.home} : ${match.score.away}`
    : "-";
  const date = new Date(match.date);
  const isFinished = ["FT", "AET", "PEN"].includes(match.status.short);
  const won = isHome ? match.homeTeam.winner : match.awayTeam.winner;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <Image src={opponent.logo} alt={opponent.name} width={28} height={28} unoptimized />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {isHome ? "홈" : "원정"} · {opponent.name}
            </p>
            <p className="text-xs text-gray-400">{match.league.nameKo ?? match.league.name}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          {isFinished ? (
            <span className={`text-sm font-bold ${won === true ? "text-blue-600" : won === false ? "text-red-500" : "text-gray-600"}`}>
              {koScore}
            </span>
          ) : (
            <span className="text-xs text-gray-500">{match.status.longKo}</span>
          )}
          <p className="text-xs text-gray-400">{date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const id = Number(teamId);
  const team = getTeamById(id);
  if (!team) notFound();

  const [{ players, coaches }, fixtures] = await Promise.all([
    getSquad(id),
    getFixtures(id, 2024),
  ]);

  const upcoming = fixtures
    .filter((m) => !["FT", "AET", "PEN"].includes(m.status.short))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 5);

  const results = fixtures
    .filter((m) => ["FT", "AET", "PEN"].includes(m.status.short))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  const byPosition: Record<string, Player[]> = {};
  players.forEach((p) => {
    const pos = p.positionKo || "기타";
    if (!byPosition[pos]) byPosition[pos] = [];
    byPosition[pos].push(p);
  });

  const posOrder = ["골키퍼", "수비수", "미드필더", "공격수", "기타"];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#C41E3A] text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-red-200 text-sm hover:text-white mb-4 inline-block">← 팀 목록</Link>
          <div className="flex items-center gap-4">
            <Image src={team.logo} alt={team.nameKo} width={56} height={56} unoptimized />
            <div>
              <h1 className="text-xl font-extrabold">{team.nameKo}</h1>
              <p className="text-red-200 text-sm">{players.length}명 · {coaches.length}명 코칭스태프</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* 코칭스태프 */}
        {coaches.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">코칭스태프</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {coaches.map((c) => <CoachCard key={c.id} coach={c} />)}
            </div>
          </section>
        )}

        {/* 선수 명단 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3">선수 명단 ({players.length}명)</h2>
          {posOrder.map((pos) =>
            byPosition[pos] ? (
              <div key={pos} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{pos}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {byPosition[pos].map((p) => <PlayerCard key={p.id} player={p} teamId={id} />)}
                </div>
              </div>
            ) : null
          )}
        </section>

        {/* 예정 경기 */}
        {upcoming.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">예정 경기</h2>
            <div className="space-y-2">
              {upcoming.map((m) => <MatchRow key={m.id} match={m} teamId={id} />)}
            </div>
          </section>
        )}

        {/* 최근 결과 */}
        {results.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3">최근 경기 결과</h2>
            <div className="space-y-2">
              {results.map((m) => <MatchRow key={m.id} match={m} teamId={id} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
