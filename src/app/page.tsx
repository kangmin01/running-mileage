import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/common/LogoutButton";
import { getHomeData } from "@/services/home.service";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { rankings, weekTotalDistance, weekUploadCount, topWeekUser } =
    await getHomeData();

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-sky-600">🏃 Running Mileage</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/fine"
            className="text-xs bg-red-50 text-red-400 border border-red-200 rounded-full px-3 py-1 font-medium hover:bg-red-100 transition"
          >
            💸 벌금
          </Link>
          <Link
            href={`/users/${session.user.id}`}
            className="text-xs bg-sky-50 text-sky-500 border border-sky-200 rounded-full px-3 py-1 font-medium hover:bg-sky-100 transition"
          >
            내 페이지
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* 이번 주 요약 */}
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <h2 className="text-sm font-semibold text-sky-500 mb-3">이번 주 요약</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-sky-700">
                {weekTotalDistance.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">km</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">총 거리</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-700">{weekUploadCount}</p>
              <p className="text-xs text-gray-400 mt-1">업로드</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-700 truncate">{topWeekUser}</p>
              <p className="text-xs text-gray-400 mt-1">이번 주 1등</p>
            </div>
          </div>
        </section>

        {/* 랭킹 */}
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <h2 className="text-sm font-semibold text-sky-500 mb-3">전체 랭킹</h2>
          <div className="flex flex-col gap-3">
            {rankings.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                아직 기록이 없어요
              </p>
            )}
            {rankings.map((user, i) => (
              <Link
                key={user.userId}
                href={`/users/${user.userId}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-sky-50 transition"
              >
                <span className="text-lg font-bold text-sky-300 w-6">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                  {user.achievement !== null && (
                    <div className="mt-1 h-1.5 bg-sky-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${user.achievement}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-sky-600">
                    {user.total.toFixed(1)} km
                  </p>
                  {user.achievement !== null && (
                    <p className="text-xs text-gray-400">{user.achievement}%</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* 기록 추가 버튼 */}
      <Link
        href="/records/new"
        className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl transition"
      >
        +
      </Link>
    </main>
  );
}
