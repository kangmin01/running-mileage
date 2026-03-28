"use client";

import { useGoalForm } from "@/hooks/useGoalForm";

interface Props {
  userId: string;
  year: number;
  month: number;
  currentGoal: number | null;
  isLocked: boolean;
}

export default function GoalForm({ userId, year, month, currentGoal, isLocked }: Props) {
  const { distance, setDistance, loading, error, handleSubmit } = useGoalForm({
    userId,
    year,
    month,
    currentGoal,
    isLocked,
  });

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
