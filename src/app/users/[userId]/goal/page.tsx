import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import GoalForm from "./GoalForm";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function GoalPage({ params }: Props) {
  const { userId } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // 본인만 접근 가능
  if (session.user.id !== userId) redirect(`/users/${userId}`);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (!profile) notFound();

  const { data: goal } = await supabase
    .from("monthly_goals")
    .select("id, target_distance")
    .eq("user_id", userId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  // 월 시작 후엔 수정 불가 (이미 목표가 있는 경우)
  const today = now.getDate();
  const isLocked = !!goal && today >= 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center gap-3">
        <Link href={`/users/${userId}`} className="text-sky-400 hover:text-sky-600 transition">
          ←
        </Link>
        <h1 className="text-lg font-bold text-sky-600">월 목표 설정</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-400">
              {year}년 {month}월 · {profile.name}
            </p>
            {isLocked && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-600">
                월이 시작된 후에는 목표를 수정할 수 없어요.
              </div>
            )}
          </div>

          <GoalForm
            userId={userId}
            year={year}
            month={month}
            currentGoal={goal?.target_distance ?? null}
            isLocked={isLocked}
          />
        </div>
      </div>
    </main>
  );
}
