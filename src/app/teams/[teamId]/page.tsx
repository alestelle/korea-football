import { getHighlights } from "@/lib/api";
import { getKFAFixtures, getKFASquad, KFAPlayer } from "@/lib/kfa";
import { getTeamById } from "@/data/teams";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Match } from "@/types/football";
import {
  getMatchNaverData,
  buildNaverSearchUrl,
  OnelineComment,
} from "@/lib/naver-sports";

export const dynamic = "force-dynamic";

const FINISHED = ["FT", "AET", "PEN"];
const PLAYER_POSITIONS = ["골키퍼", "수비수", "미드필더", "공격수"];

function TeamLogo({ src, alt, size = 28 }: { src: string; alt: string; size?: number }) {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0"
      >
        <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      </div>
    );
  }
  return <Image src={src} alt={alt} width={size} height={size} unoptimized />;
}

function MatchCard({
  match,
  teamId,
  gameUrl,
  comments,
}: {
  match: Match;
  teamId: number;
  gameUrl: string | null;
  comments: OnelineComment[];
}) {
  const isHome = match.homeTeam.id === teamId;
  const isFinished = FINISHED.includes(match.status.short);
  const won = isHome ? match.homeTeam.winner : match.awayTeam.winner;
  const date = new Date(match.date);
  const opponent = isHome
    ? (match.awayTeam.nameKo ?? match.awayTeam.name)
    : (match.homeTeam.nameKo ?? match.homeTeam.name);
  const href = gameUrl ?? buildNaverSearchUrl(opponent, date);

  const resultBadge = isFinished
    ? won === true
      ? { label: "승", color: "bg-blue-100 text-blue-700" }
      : won === false
      ? { label: "패", color: "bg-red-100 text-red-600" }
      : { label: "무", color: "bg-gray-100 text-gray-600" }
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
      {/* 경기 정보 → 네이버 스포츠 링크 */}
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {/* 대회명 + 날짜 */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1.5 border-b border-gray-50">
          <span className="text-xs text-gray-500 font-medium truncate flex-1">
            {match.league.nameKo ?? match.league.name}
            {match.league.round ? ` · ${match.league.round}` : ""}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
            {date.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>

        {/* 팀 로고 + 스코어 */}
        <div className="flex items-center justify-between px-4 py-2.5 gap-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo src={match.homeTeam.logo} alt={match.homeTeam.name} />
            <span className={`text-xs font-medium text-center leading-tight ${match.homeTeam.id === teamId ? "text-blue-700 font-bold" : "text-gray-700"}`}>
              {match.homeTeam.nameKo ?? match.homeTeam.name}
            </span>
            <span className="text-[10px] text-gray-400">홈</span>
          </div>

          <div className="flex flex-col items-center gap-1 flex-shrink-0 px-3">
            {isFinished ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-gray-800">{match.score.home}</span>
                  <span className="text-base text-gray-300">:</span>
                  <span className="text-xl font-extrabold text-gray-800">{match.score.away}</span>
                </div>
                {resultBadge && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${resultBadge.color}`}>
                    {resultBadge.label}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-base font-bold text-gray-300">VS</span>
                <span className="text-[11px] text-gray-400 font-medium">{match.status.longKo}</span>
              </>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 flex-1">
            <TeamLogo src={match.awayTeam.logo} alt={match.awayTeam.name} />
            <span className={`text-xs font-medium text-center leading-tight ${match.awayTeam.id === teamId ? "text-blue-700 font-bold" : "text-gray-700"}`}>
              {match.awayTeam.nameKo ?? match.awayTeam.name}
            </span>
            <span className="text-[10px] text-gray-400">원정</span>
          </div>
        </div>

        {/* 경기장 */}
        {(match.venue?.name || match.venue?.city) && (
          <div className="flex items-center gap-1.5 px-4 pb-2">
            <svg className="w-3 h-3 text-gray-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-400 truncate">
              {[match.venue.name, match.venue.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
      </a>

      {/* 한줄평 */}
      {comments.length > 0 && (
        <div className="border-t border-gray-50 px-4 pt-2.5 pb-3">
          <p className="text-[11px] font-semibold text-gray-400 mb-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            네이버 스포츠 한줄평
          </p>
          <ul className="space-y-1.5">
            {comments.map((c, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-gray-300 flex-shrink-0 mt-px leading-none">›</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2 leading-snug">{c.text}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {c.author}
                    {c.likes > 0 && ` · 👍 ${c.likes}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: KFAPlayer }) {
  const naverUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(player.nameKo + " 축구선수")}`;
  const instaUrl = `https://www.google.com/search?q=${encodeURIComponent(player.nameKo + " 축구선수 instagram")}`;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        {player.photo ? (
          <Image src={player.photo} alt={player.nameKo} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-gray-900 truncate">{player.nameKo}</p>
        <p className="text-xs text-gray-400">
          {player.positionKo}
          {player.club ? ` · ${player.club}` : ""}
        </p>
      </div>
      {/* 네이버 N + 인스타그램 아이콘 */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <a
          href={naverUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded-full bg-[#03C75A] flex items-center justify-center hover:opacity-75 transition-opacity"
          title="네이버 검색"
        >
          <span className="text-white text-[11px] font-extrabold leading-none">N</span>
        </a>
        <a
          href={instaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-75 transition-opacity"
          style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}
          title="인스타그램"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function CoachCard({ player }: { player: KFAPlayer }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        {player.photo ? (
          <Image src={player.photo} alt={player.nameKo} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{player.nameKo}</p>
        <p className="text-xs text-gray-400">
          {player.positionKo}
          {player.club ? ` · ${player.club}` : ""}
        </p>
      </div>
    </div>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const id = Number(teamId);
  const team = getTeamById(id);
  if (!team) notFound();

  const [allMembers, fixtures, highlights] = await Promise.all([
    getKFASquad(team.kfaAct).catch(() => [] as KFAPlayer[]),
    getKFAFixtures(id, team.kfaTeamKeyword).catch(() => [] as Match[]),
    getHighlights(team.highlightQuery, 6).catch(() => []),
  ]);

  // 지도자(감독/코치)와 선수 분리
  const coaches = allMembers.filter((p) => !PLAYER_POSITIONS.includes(p.positionKo));
  const players = allMembers.filter((p) => PLAYER_POSITIONS.includes(p.positionKo));

  // 최근 완료 경기 5개 (최신순)
  const recentResults = fixtures
    .filter((m) => FINISHED.includes(m.status.short))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // 예정 경기 전체 (가장 빠른 순)
  const upcomingMatches = fixtures
    .filter((m) => !FINISHED.includes(m.status.short))
    .sort((a, b) => a.timestamp - b.timestamp);

  // 완료 경기에 대해서만 네이버 스포츠 데이터 조회
  const recentNaverData = await Promise.all(
    recentResults.map((m) => {
      const opponent =
        m.homeTeam.id === id
          ? (m.awayTeam.nameKo ?? m.awayTeam.name)
          : (m.homeTeam.nameKo ?? m.homeTeam.name);
      return getMatchNaverData(opponent, new Date(m.date)).catch(() => ({
        gameUrl: null,
        comments: [] as OnelineComment[],
      }));
    })
  );

  // 예정 경기 링크는 Naver 검색으로 폴백
  const upcomingNaverUrls = upcomingMatches.map((m) => {
    const opponent =
      m.homeTeam.id === id
        ? (m.awayTeam.nameKo ?? m.awayTeam.name)
        : (m.homeTeam.nameKo ?? m.homeTeam.name);
    return buildNaverSearchUrl(opponent, new Date(m.date));
  });

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
              {recentResults.map((m, i) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  teamId={id}
                  gameUrl={recentNaverData[i]?.gameUrl ?? null}
                  comments={recentNaverData[i]?.comments ?? []}
                />
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
              {upcomingMatches.map((m, i) => (
                <MatchCard
                  key={m.id}
                  match={m}
                  teamId={id}
                  gameUrl={upcomingNaverUrls[i]}
                  comments={[]}
                />
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
              {highlights.slice(0, 6).map((h) => (
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
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(team.highlightQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:border-red-300 hover:text-red-600 transition-all text-sm font-medium text-gray-500"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              유튜브에서 더보기
            </a>
          </section>
        )}

        {/* ④ 선수단 */}
        <section>
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-1 h-5 bg-gray-400 rounded-full inline-block" />
            선수단 ({players.length}명)
          </h2>

          {/* 감독/코치 */}
          {coaches.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">감독 · 코칭스태프</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {coaches.map((c) => <CoachCard key={c.id} player={c} />)}
              </div>
            </div>
          )}

          {players.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">선수단 정보가 없습니다</p>
          ) : (
            posOrder.map((pos) =>
              byPosition[pos] ? (
                <div key={pos} className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{pos}</h3>
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
