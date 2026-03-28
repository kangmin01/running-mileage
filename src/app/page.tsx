import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "./logout/LogoutButton";

async function getHomeData() {
  const supabase = await createClient();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 이번 주 월요일 ~ 일요일
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  // 전체 러닝 기록 (유저 정보 포함)
  const { data: records } = await supabase
    .from("running_records")
    .select("user_id, distance, date, profiles(name)");

  // 이번 달 목표
  const { data: goals } = await supabase
    .from("monthly_goals")
    .select("user_id, target_distance")
    .eq("year", year)
    .eq("month", month);

  // 전체 프로필
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name");

  // 이번 주 기록
  const weekRecords = (records ?? []).filter(
    (r) => r.date >= weekStart && r.date <= weekEnd
  );

  // 유저별 총 마일리지 계산
  const mileageMap: Record<string, { name: string; total: number }> = {};
  for (const r of records ?? []) {
    if (!mileageMap[r.user_id]) {
      mileageMap[r.user_id] = {
        name: (r.profiles as { name: string } | null)?.name ?? "Unknown",
        total: 0,
      };
    }
    mileageMap[r.user_id].total += Number(r.distance);
  }

  // 랭킹 (총 마일리지 순)
  const rankings = Object.entries(mileageMap)
    .map(([userId, { name, total }]) => {
      const goal = goals?.find((g) => g.user_id === userId);
      const achievement = goal
        ? Math.min(Math.round((total / goal.target_distance) * 100), 100)
        : null;
      return { userId, name, total, achievement };
    })
    .sort((a, b) => b.total - a.total);

  // 기록 없는 유저도 랭킹에 포함
  for (const p of profiles ?? []) {
    if (!mileageMap[p.id]) {
      const goal = goals?.find((g) => g.user_id === p.id);
      rankings.push({
        userId: p.id,
        name: p.name,
        total: 0,
        achievement: goal ? 0 : null,
      });
    }
  }

  // 이번 주 요약
  const weekTotalDistance = weekRecords.reduce(
    (sum, r) => sum + Number(r.distance),
    0
  );
  const weekUploadCount = weekRecords.length;

  const weekUserMap: Record<string, number> = {};
  for (const r of weekRecords) {
    weekUserMap[r.user_id] = (weekUserMap[r.user_id] ?? 0) + Number(r.distance);
  }
  const topWeekUserId = Object.entries(weekUserMap).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];
  const topWeekUser = profiles?.find((p) => p.id === topWeekUserId)?.name ?? "-";

  return { rankings, weekTotalDistance, weekUploadCount, topWeekUser };
}

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
