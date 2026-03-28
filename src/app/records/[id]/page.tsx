import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import RecordEditForm from "./RecordEditForm";
import DeleteButton from "./DeleteButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecordDetailPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: record } = await supabase
    .from("running_records")
    .select("*")
    .eq("id", id)
    .single();

  if (!record) notFound();

  const isOwner = session.user.id === record.user_id;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-white pb-24">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-sky-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/users/${record.user_id}`} className="text-sky-400 hover:text-sky-600 transition">
            ←
          </Link>
          <h1 className="text-lg font-bold text-sky-600">러닝 기록</h1>
        </div>
        {isOwner && <DeleteButton recordId={id} userId={record.user_id} />}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-sky-100 p-6">
          {isOwner ? (
            <RecordEditForm record={record} />
          ) : (
            <RecordView record={record} />
          )}
        </div>
      </div>
    </main>
  );
}

function RecordView({ record }: { record: Record<string, unknown> }) {
  const hours = Math.floor(Number(record.duration) / 60);
  const minutes = Number(record.duration) % 60;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{String(record.date)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-sky-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">거리</p>
          <p className="text-xl font-bold text-sky-700">{Number(record.distance).toFixed(2)} km</p>
        </div>
        <div className="bg-sky-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">시간</p>
          <p className="text-xl font-bold text-sky-700">
            {hours > 0 ? `${hours}시간 ` : ""}{minutes}분
          </p>
        </div>
        <div className="bg-sky-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-1">평균 페이스</p>
          <p className="text-xl font-bold text-sky-700">{Number(record.pace).toFixed(1)} min/km</p>
        </div>
        {record.cadence && (
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">케이던시</p>
            <p className="text-xl font-bold text-sky-700">{String(record.cadence)} spm</p>
          </div>
        )}
        {record.heart_rate && (
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">심박수</p>
            <p className="text-xl font-bold text-sky-700">{String(record.heart_rate)} bpm</p>
          </div>
        )}
      </div>
    </div>
  );
}
