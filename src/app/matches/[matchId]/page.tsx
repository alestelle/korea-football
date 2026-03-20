import { getFixture } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { translateEventType } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const match = await getFixture(Number(matchId));
  if (!match) notFound();

  const date = new Date(match.date);
  const isFinished = ["FT", "AET", "PEN"].includes(match.status.short);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#1a1a2e] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-gray-400 text-sm hover:text-white mb-4 inline-block">← 홈</Link>

          {/* 대회명 */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Image src={match.league.logo} alt={match.league.name} width={18} height={18} unoptimized />
              <span className="text-gray-300 text-sm">{match.league.nameKo ?? match.league.name}</span>
            </div>
            <p className="text-gray-400 text-xs">
              {date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
              {" "}
              {date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* 스코어 */}
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex-1 flex flex-col items-center gap-2">
              <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={56} height={56} unoptimized />
              <span className="text-sm font-bold text-center leading-tight">{match.homeTeam.name}</span>
            </div>

            <div className="text-center">
              {isFinished ? (
                <div className="text-4xl font-extrabold tabular-nums">
                  {match.score.home} : {match.score.away}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{match.status.longKo}</div>
                  {match.status.elapsed && (
                    <div className="text-sm text-gray-400">{match.status.elapsed}&apos;</div>
                  )}
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">{isFinished ? "최종 결과" : ""}</div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={56} height={56} unoptimized />
              <span className="text-sm font-bold text-center leading-tight">{match.awayTeam.name}</span>
            </div>
          </div>

          {match.venue?.name && (
            <p className="text-center text-gray-400 text-xs mt-2">📍 {match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ""}</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* 경기 이벤트 */}
        {match.events && match.events.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">경기 이벤트</h2>
            <div className="space-y-2">
              {match.events.map((event, i) => {
                const isHome = event.team.id === match.homeTeam.id;
                const typeKo = translateEventType(event.type, event.detail);
                const icon =
                  event.type === "Goal" ? "⚽"
                  : event.detail === "Yellow Card" ? "🟨"
                  : event.detail === "Red Card" ? "🟥"
                  : event.type === "subst" || event.type === "Substitution" ? "🔄"
                  : "•";

                return (
                  <div key={i} className={`flex items-center gap-3 text-sm ${isHome ? "" : "flex-row-reverse"}`}>
                    <span className="text-gray-400 tabular-nums w-8 text-center flex-shrink-0">{event.time.elapsed}&apos;</span>
                    <span className="text-lg">{icon}</span>
                    <div className={`flex-1 ${isHome ? "" : "text-right"}`}>
                      <span className="font-medium text-gray-800">{event.player.name}</span>
                      {event.assist?.name && (
                        <span className="text-gray-400 text-xs"> ({event.assist.name})</span>
                      )}
                      <span className="text-gray-500 text-xs ml-1">· {typeKo}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!isFinished && (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">경기가 시작되면 세부 정보가 표시됩니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
