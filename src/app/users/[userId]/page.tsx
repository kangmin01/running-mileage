import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MonthCalendar from "@/components/users/MonthCalendar";
import MonthNav from "@/components/users/MonthNav";
import { getUserData } from "@/services/user.service";

interface Props {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function UserDashboardPage({ params, searchParams }: Props) {
  const { userId } = await params;
  const { year: yearStr, month: monthStr } = await searchParams;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const targetYear = yearStr ? Number(yearStr) : now.getFullYear();
  const targetMonth = monthStr ? Number(monthStr) : now.getMonth() + 1;

  const data = await getUserData(userId, targetYear, targetMonth);
  if (!data) notFound();

  const { profile, goal, monthRecords, totalDistance, monthDistance, achievement, badges, year, month } = data;

  const isOwner = session.user.id === userId;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-sky-400 hover:text-sky-600 transition">
          ←
        </Link>
        <h1 className="text-lg font-bold text-sky-600">{profile.name}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* 이번 달 요약 카드 */}
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <MonthNav userId={userId} year={year} month={month} />
            {isOwner && (
              <Link
                href={`/users/${userId}/goal`}
                className="text-xs text-sky-400 border border-sky-200 rounded-full px-3 py-1 hover:bg-sky-50 transition"
              >
                목표 설정
              </Link>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-sky-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">이번 달</p>
              <p className="text-lg font-bold text-sky-700">
                {monthDistance.toFixed(1)}
                <span className="text-xs font-normal ml-1">km</span>
              </p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">총 누적</p>
              <p className="text-lg font-bold text-indigo-600">
                {totalDistance.toFixed(1)}
                <span className="text-xs font-normal ml-1">km</span>
              </p>
            </div>
            <div className="bg-sky-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">월 목표</p>
              <p className="text-lg font-bold text-sky-700">
                {goal ? `${goal.target_distance}km` : "미설정"}
              </p>
            </div>
          </div>

          {achievement !== null && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>목표 달성률</span>
                <span>{achievement}%</span>
              </div>
              <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full transition-all"
                  style={{ width: `${achievement}%` }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 달력 */}
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <h2 className="text-sm font-semibold text-sky-500 mb-3">
            {year}년 {month}월 기록
          </h2>
          <MonthCalendar records={monthRecords} year={year} month={month} />
        </section>

        {/* 기록 리스트 */}
        {monthRecords.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
            <h2 className="text-sm font-semibold text-sky-500 mb-3">기록 목록</h2>
            <div className="flex flex-col gap-2">
              {monthRecords.map((r) => (
                <Link
                  key={r.id}
                  href={`/records/${r.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{r.date}</p>
                    <p className="text-xs text-gray-400">{r.duration}분 · {r.pace} min/km</p>
                  </div>
                  <p className="text-sm font-bold text-sky-600">{Number(r.distance).toFixed(1)} km</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 뱃지 */}
        {badges.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
            <h2 className="text-sm font-semibold text-sky-500 mb-3">뱃지</h2>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="bg-sky-50 border border-sky-100 rounded-full px-3 py-1 text-xs text-sky-600 font-medium"
                  title={b.description ?? ""}
                >
                  🏅 {b.type}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 기록 추가 버튼 (본인만) */}
        {isOwner && (
          <Link
            href="/records/new"
            className="fixed bottom-6 right-6 bg-sky-500 hover:bg-sky-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-2xl transition"
          >
            +
          </Link>
        )}
      </div>
    </main>
  );
}
