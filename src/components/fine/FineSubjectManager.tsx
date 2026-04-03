"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile, FineConfig } from "@/types";

interface Props {
  profiles: Profile[];
  fineSubjectIds: string[];
  fineConfig: FineConfig;
}

export default function FineSubjectManager({ profiles, fineSubjectIds, fineConfig }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(fineSubjectIds));
  const [amount, setAmount] = useState(String(fineConfig.amount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const supabase = createClient();

    // 벌금 대상자 업데이트: 기존 전체 삭제 후 재삽입
    const { error: delErr } = await supabase.from("fine_subjects").delete().neq("user_id", "00000000-0000-0000-0000-000000000000");
    if (delErr) { setError("저장 실패"); setSaving(false); return; }

    if (selectedIds.size > 0) {
      const inserts = [...selectedIds].map((user_id) => ({ user_id }));
      const { error: insErr } = await supabase.from("fine_subjects").insert(inserts);
      if (insErr) { setError("저장 실패"); setSaving(false); return; }
    }

    // 벌금액 업데이트
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      await supabase.from("fine_config").upsert({ id: 1, amount: parsedAmount });
    }

    setSaving(false);
    router.refresh();
    setOpen(false);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-amber-500">벌금 대상자 관리</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            현재 {fineSubjectIds.length}명 · 건당 {fineConfig.amount.toLocaleString()}원
          </p>
        </div>
        <button
          onClick={() => { setOpen((v) => !v); setSelectedIds(new Set(fineSubjectIds)); setAmount(String(fineConfig.amount)); }}
          className="text-xs bg-amber-400 text-white rounded-full px-3 py-1 hover:bg-amber-500 transition"
        >
          {open ? "취소" : "수정"}
        </button>
      </div>

      {!open && fineSubjectIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profiles
            .filter((p) => fineSubjectIds.includes(p.id))
            .map((p) => (
              <span key={p.id} className="text-xs bg-amber-50 text-amber-600 border border-amber-200 rounded-full px-3 py-1">
                {p.name}
              </span>
            ))}
        </div>
      )}

      {!open && fineSubjectIds.length === 0 && (
        <p className="text-xs text-gray-400">지정된 벌금 대상자가 없어요</p>
      )}

      {open && (
        <div className="flex flex-col gap-4">
          {/* 벌금액 설정 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">고정 벌금액</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 w-40"
                min={0}
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </div>

          {/* 대상자 선택 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">벌금 대상자 선택</label>
            <div className="flex flex-col gap-2">
              {profiles.map((p) => (
                <label key={p.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-amber-50 transition">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="w-4 h-4 accent-amber-400"
                  />
                  <span className="text-sm text-gray-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-400 hover:bg-amber-500 disabled:bg-amber-200 text-white text-sm font-semibold rounded-lg py-2 transition"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      )}
    </section>
  );
}
