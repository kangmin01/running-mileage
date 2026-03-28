import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import RecordForm from "@/components/records/RecordForm";

export default async function NewRecordPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white pb-24">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-sky-400 hover:text-sky-600 transition">
          ←
        </Link>
        <h1 className="text-lg font-bold text-sky-600">러닝 기록 등록</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          <RecordForm userId={session.user.id} today={today} />
        </div>
      </div>
    </main>
  );
}
