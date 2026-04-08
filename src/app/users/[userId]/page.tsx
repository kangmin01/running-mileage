import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MonthDashboard from "@/components/users/MonthDashboard";
import StravaConnect from "@/components/strava/StravaConnect";
import { getUserData } from "@/services/user.service";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function UserDashboardPage({ params }: Props) {
  const { userId } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const data = await getUserData(userId);
  if (!data) notFound();

  const { profile, goal, monthRecords, totalDistance, badges, year, month } = data;

  const isOwner = session.user.id === userId;

  let stravaConnected = false;
  if (isOwner) {
    const { data: stravaConn } = await supabase
      .from("strava_connections")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();
    stravaConnected = !!stravaConn;
  }

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
        {/* 월별 대시보드 (클라이언트 컴포넌트) */}
        <MonthDashboard
          userId={userId}
          isOwner={isOwner}
          initialYear={year}
          initialMonth={month}
          initialRecords={monthRecords}
          initialGoal={goal}
          totalDistance={totalDistance}
        />

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

        {/* Strava 연동 (본인만) */}
        {isOwner && <StravaConnect connected={stravaConnected} />}

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
