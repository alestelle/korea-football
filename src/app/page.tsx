import Link from "next/link";
import Image from "next/image";
import { KOREA_TEAMS } from "@/data/teams";
import { Team } from "@/types/football";

const CATEGORY_LABEL: Record<string, string> = {
  senior: "성인",
  u23: "U-23",
  u20: "U-20",
  u17: "U-17",
};

function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.id}`}>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer">
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
      </div>
    </Link>
  );
}

export default function HomePage() {
  const maleTeams = KOREA_TEAMS.filter((t) => t.gender === "male");
  const femaleTeams = KOREA_TEAMS.filter((t) => t.gender === "female");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#C41E3A] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-200 text-sm font-medium mb-2">대한민국 축구</p>
          <h1 className="text-3xl font-extrabold mb-1">🇰🇷 국가대표팀</h1>
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
            {maleTeams.map((team) => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-pink-500 rounded-full inline-block" />
            여자 대표팀
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {femaleTeams.map((team) => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>
      </div>
    </main>
  );
}
