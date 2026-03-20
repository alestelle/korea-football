import { getPlayer } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  const { playerId } = await params;
  const { team } = await searchParams;
  const teamId = Number(team ?? 732);
  const player = await getPlayer(Number(playerId), teamId);
  if (!player) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#C41E3A] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Link href={`/teams/${teamId}`} className="text-red-200 text-sm hover:text-white mb-4 inline-block">
            ← 팀으로 돌아가기
          </Link>
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-red-800 flex-shrink-0">
              {player.photo ? (
                <Image src={player.photo} alt={player.nameKo ?? player.name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{player.nameKo ?? player.name}</h1>
              <p className="text-red-200">{player.name}</p>
              <div className="flex gap-2 mt-1">
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{player.positionKo}</span>
                {player.number && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">#{player.number}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 기본 정보 */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">기본 정보</h2>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            {player.birth?.date && (
              <>
                <span className="text-gray-500">생년월일</span>
                <span className="font-medium">{new Date(player.birth.date).toLocaleDateString("ko-KR")}</span>
              </>
            )}
            <span className="text-gray-500">나이</span>
            <span className="font-medium">{player.age}세</span>
            <span className="text-gray-500">국적</span>
            <span className="font-medium">{player.nationalityKo}</span>
            {player.height && (
              <>
                <span className="text-gray-500">키</span>
                <span className="font-medium">{player.height}</span>
              </>
            )}
            {player.weight && (
              <>
                <span className="text-gray-500">몸무게</span>
                <span className="font-medium">{player.weight}</span>
              </>
            )}
            {player.club && (
              <>
                <span className="text-gray-500">소속 클럽</span>
                <span className="font-medium flex items-center gap-2">
                  <Image src={player.club.logo} alt={player.club.name} width={16} height={16} unoptimized />
                  {player.club.name}
                </span>
              </>
            )}
          </div>
        </section>

        {/* 시즌 통계 */}
        {player.statistics && (
          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">2024 시즌 통계 (클럽)</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "출전", value: player.statistics.appearances },
                { label: "골", value: player.statistics.goals },
                { label: "어시스트", value: player.statistics.assists },
                { label: "경고", value: player.statistics.yellowCards },
                { label: "퇴장", value: player.statistics.redCards },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
