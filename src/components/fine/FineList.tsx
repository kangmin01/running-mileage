"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Fine, Profile } from "@/types";

interface Props {
  fines: Fine[];
  profiles: Profile[];
  isAdmin: boolean;
  currentUserId: string;
}

export default function FineList({ fines, profiles, isAdmin, currentUserId }: Props) {
  const router = useRouter();
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [showForm, setShowForm] = useState(false);

  // 필터링
  const filtered = fines.filter((f) => {
    if (f.year !== filterYear) return false;
    if (filterMonth !== "all" && f.month !== filterMonth) return false;
    return true;
  });

  const filteredTotal = filtered.reduce((sum, f) => sum + f.amount, 0);

  const years = [...new Set(fines.map((f) => f.year))].sort((a, b) => b - a);
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear());

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-sky-500">벌금 내역</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs bg-sky-500 text-white rounded-full px-3 py-1 hover:bg-sky-600 transition"
          >
            {showForm ? "취소" : "+ 벌금 등록"}
          </button>
        )}
      </div>

      {/* 관리자 벌금 등록 폼 */}
      {isAdmin && showForm && (
        <FineForm
          profiles={profiles}
          onSuccess={() => { setShowForm(false); router.refresh(); }}
        />
      )}

      {/* 필터 */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="text-sm border border-sky-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="text-sm border border-sky-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="all">전체</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
      </div>

      {/* 필터 합계 */}
      <div className="bg-red-50 rounded-xl px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {filterYear}년 {filterMonth === "all" ? "전체" : `${filterMonth}월`}
        </span>
        <span className="text-sm font-bold text-red-400">
          {filteredTotal.toLocaleString()}원
        </span>
      </div>

      {/* 리스트 */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">벌금 내역이 없어요</p>
        )}
        {filtered.map((f) => (
          <FineItem key={f.id} fine={f} isAdmin={isAdmin} onDelete={() => router.refresh()} />
        ))}
      </div>
    </section>
  );
}

function FineItem({
  fine,
  isAdmin,
  onDelete,
}: {
  fine: Fine;
  isAdmin: boolean;
  onDelete: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("fines").delete().eq("id", fine.id);
    setLoading(false);
    onDelete();
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50 transition">
      <div>
        <p className="text-sm font-semibold text-gray-700">
          {fine.profiles?.[0]?.name ?? "Unknown"}
        </p>
        <p className="text-xs text-gray-400">
          {fine.year}년 {fine.month}월 {fine.reason ? `· ${fine.reason}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-red-400">{fine.amount.toLocaleString()}원</p>
        {isAdmin && (
          confirm ? (
            <div className="flex gap-1">
              <button
                onClick={() => setConfirm(false)}
                className="text-xs text-gray-400 px-2 py-0.5 border border-gray-200 rounded-full"
              >취소</button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-xs text-white bg-red-400 px-2 py-0.5 rounded-full"
              >{loading ? "..." : "확인"}</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="text-xs text-red-300 hover:text-red-500 transition"
            >삭제</button>
          )
        )}
      </div>
    </div>
  );
}

function FineForm({
  profiles,
  onSuccess,
}: {
  profiles: Profile[];
  onSuccess: () => void;
}) {
  const now = new Date();
  const [form, setForm] = useState({
    user_id: profiles[0]?.id ?? "",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    amount: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return setError("금액을 입력해주세요.");

    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.from("fines").insert({
      user_id: form.user_id,
      year: form.year,
      month: form.month,
      amount: Number(form.amount),
      reason: form.reason || null,
    });
    setLoading(false);
    if (err) return setError("저장에 실패했어요.");
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-sky-50 rounded-xl p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.user_id}
          onChange={(e) => set("user_id", e.target.value)}
          className="border border-sky-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="금액 (원)"
          value={form.amount}
          onChange={(e) => set("amount", e.target.value)}
          className="border border-sky-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
        <select
          value={form.year}
          onChange={(e) => set("year", Number(e.target.value))}
          className="border border-sky-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          value={form.month}
          onChange={(e) => set("month", Number(e.target.value))}
          className="border border-sky-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="사유 (선택)"
        value={form.reason}
        onChange={(e) => set("reason", e.target.value)}
        className="border border-sky-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white text-sm font-semibold rounded-lg py-2 transition"
      >
        {loading ? "저장 중..." : "등록"}
      </button>
    </form>
  );
}
