import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import FineList from "@/components/fine/FineList";
import FineSubjectManager from "@/components/fine/FineSubjectManager";
import { getFines, autoGenerateFines } from "@/services/fine.service";

export default async function FinePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  // 새 달 시작 시 이전 달 벌금 자동 부과
  await autoGenerateFines();

  const { fines, profiles, totalAmount, fineSubjectIds, fineConfig } = await getFines();

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white pb-24">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-sky-400 hover:text-sky-600 transition">←</Link>
        <h1 className="text-lg font-bold text-sky-600">💸 벌금</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* 총 누적 벌금 */}
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <p className="text-sm text-gray-400 mb-1">총 누적 벌금</p>
          <p className="text-3xl font-bold text-red-400">
            {totalAmount.toLocaleString()}
            <span className="text-base font-normal text-gray-400 ml-1">원</span>
          </p>
        </section>

        {/* 관리자 - 벌금 대상자 관리 */}
        {isAdmin && (
          <FineSubjectManager
            profiles={profiles}
            fineSubjectIds={fineSubjectIds}
            fineConfig={fineConfig}
          />
        )}

        {/* 벌금 리스트 */}
        <FineList
          fines={fines}
          profiles={profiles}
          isAdmin={isAdmin}
          currentUserId={session.user.id}
          fineAmount={fineConfig.amount}
          fineSubjectIds={fineSubjectIds}
        />
      </div>
    </main>
  );
}
