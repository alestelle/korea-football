import { getHighlights } from "@/lib/api";
import { getKFAFixtures, getKFASquad, KFAPlayer } from "@/lib/kfa";
import { getTeamById } from "@/data/teams";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Match } from "@/types/football";

export const dynamic = "force-dynamic";

const FINISHED = ["FT", "AET", "PEN"];

function MatchCard({ match, teamId }: { match: Match; teamId: number }) {
  const isHome = match.homeTeam.id === teamId;
  const isFinished = FINISHED.includes(match.status.short);
  const won = isHome ? match.homeTeam.winner : match.awayTeam.winner;
  const date = new Date(match.date);

  const resultBadge = isFinished
    ? won === true
      ? { label: "승", color: "bg-blue-100 text-blue-700" }
      : won === false
      ? { label: "패", color: "bg-red-100 text-red-600" }
      : { label: "무", color: "bg-gray-100 text-gray-600" }
    : null;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
        {/* 대회명 + 날짜 */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-50">
          <span className="text-xs text-gray-500 font-medium truncate flex-1">
            {match.league.nameKo ?? match.league.name}
            {match.league.round ? ` · ${match.league.round}` : ""}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>

        {/* 팀 로고 + 스코어 */}
        <div className="flex items-center justify-between px-4 py-4 gap-2">
          {/* 홈팀 */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={36} height={36} unoptimized />
            <span className={`text-xs font-medium text-center leading-tight ${match.homeTeam.id === teamId ? "text-blue-700 font-bold" : "text-gray-700"}`}>
              {match.homeTeam.nameKo ?? match.homeTeam.name}
            </span>
            <span className="text-[10px] text-gray-400">홈</span>
          </div>

          {/* 스코어 */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 px-3">
            {isFinished ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-gray-800">{match.score.home}</span>
                  <span className="text-lg text-gray-300">:</span>
                  <span className="text-2xl font-extrabold text-gray-800">{match.score.away}</span>
                </div>
                {resultBadge && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${resultBadge.color}`}>
                    {resultBadge.label}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-300">VS</span>
                <span className="text-[11px] text-gray-400 font-medium">{match.status.longKo}</span>
              </>
            )}
          </div>

          {/* 원정팀 */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={36} height={36} unoptimized />
            <span className={`text-xs font-medium text-center leading-tight ${match.awayTeam.id === teamId ? "text-blue-700 font-bold" : "text-gray-700"}`}>
              {match.awayTeam.nameKo ?? match.awayTeam.name}
            </span>
            <span className="text-[10px] text-gray-400">원정</span>
          </div>
        </div>

        {/* 경기장 */}
        {(match.venue?.name || match.venue?.city) && (
          <div className="flex items-center gap-1.5 px-4 pb-3">
            <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 truncate">
              {[match.venue.name, match.venue.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function PlayerCard({ player }: { player: KFAPlayer }) {
  const displayName = player.nameKo;
  const naverUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent("축구선수 " + displayName)}`;

  return (
    <a href={naverUrl} target="_blank" rel="noopener noreferrer">
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all group">
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {player.photo ? (
            <Image src={player.photo} alt={displayName} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-400">
            {player.positionKo}
            {player.club ? ` · ${player.club}` : ""}
          </p>
        </div>
      </div>
    </a>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const id = Number(teamId);
  const team = getTeamById(id);
  if (!team) notFound();

  const [players, fixtures, highlights] = await Promise.all([
    getKFASquad(team.kfaAct).catch(() => [] as KFAPlayer[]),
    getKFAFixtures(id, team.kfaTeamKeyword).catch(() => [] as Match[]),
    getHighlights(team.highlightQuery, 12).catch(() => []),
  ]);

  // 최근 완료 경기 5개 (최신순)
  const recentResults = fixtures
    .filter((m) => FINISHED.includes(m.status.short))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // 예정 경기 전체 (가장 빠른 순)
  const upcomingMatches = fixtures
    .filter((m) => !FINISHED.includes(m.status.short))
    .sort((a, b) => a.timestamp - b.timestamp);

  const byPosition: Record<string, KFAPlayer[]> = {};
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
              <p className="text-red-200 text-sm">{players.length}명</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ① 최근 경기 5개 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
            최근 경기
          </h2>
          {recentResults.length > 0 ? (
            <div className="space-y-3">
              {recentResults.map((m) => (
                <MatchCard key={m.id} match={m} teamId={id} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">경기 기록이 없습니다</p>
          )}
        </section>

        {/* ② 예정 경기 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
            예정 경기
          </h2>
          {upcomingMatches.length > 0 ? (
            <div className="space-y-3">
              {upcomingMatches.map((m) => (
                <MatchCard key={m.id} match={m} teamId={id} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 px-4 py-6 text-center">
              <p className="text-sm text-gray-400">확정된 예정 경기가 없습니다</p>
              <p className="text-xs text-gray-300 mt-1">미정</p>
            </div>
          )}
        </section>

        {/* ③ 하이라이트 영상 */}
        {highlights.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
              🎬 하이라이트 영상
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {highlights.map((h) => (
                <a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-white"
                >
                  <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={h.thumb}
                      alt={h.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-700 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {h.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ④ 선수단 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-gray-400 rounded-full inline-block" />
            선수단 ({players.length}명)
          </h2>

          {players.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">선수단 정보가 없습니다</p>
          ) : (
            posOrder.map((pos) =>
              byPosition[pos] ? (
                <div key={pos} className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{pos}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {byPosition[pos].map((p) => <PlayerCard key={p.id} player={p} />)}
                  </div>
                </div>
              ) : null
            )
          )}
        </section>

      </div>
    </main>
  );
}
