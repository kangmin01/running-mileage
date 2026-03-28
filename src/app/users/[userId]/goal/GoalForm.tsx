"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  year: number;
  month: number;
  currentGoal: number | null;
  isLocked: boolean;
}

export default function GoalForm({ userId, year, month, currentGoal, isLocked }: Props) {
  const router = useRouter();
  const [distance, setDistance] = useState(currentGoal?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const value = parseFloat(distance);
    if (isNaN(value) || value <= 0) {
      setError("올바른 거리를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: err } = await supabase
      .from("monthly_goals")
      .upsert(
        { user_id: userId, year, month, target_distance: value },
        { onConflict: "user_id,year,month" }
      );

    setLoading(false);

    if (err) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    router.push(`/users/${userId}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">
          목표 거리 (km)
        </label>
        <div className="relative">
          <input
            type="number"
            step="0.1"
            min="1"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            disabled={isLocked}
            placeholder="예: 100"
            className="w-full border border-sky-200 rounded-xl px-4 py-3 text-lg font-semibold text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            km
          </span>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      {!isLocked && (
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold rounded-xl py-3 transition"
        >
          {loading ? "저장 중..." : currentGoal ? "목표 수정" : "목표 등록"}
        </button>
      )}
    </form>
  );
}
