"use client";

import { useRecordEditForm } from "@/hooks/useRecordForm";

interface Props {
  record: Record<string, unknown>;
}

export default function RecordEditForm({ record }: Props) {
  const { form, set, pacePreview, loading, error, handleSubmit } = useRecordEditForm(record);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* 날짜 */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">날짜</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
          className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      {/* 거리 */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">거리</label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.distance}
            onChange={(e) => set("distance", e.target.value)}
            className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">km</span>
        </div>
      </div>

      {/* 운동 시간 */}
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-2">운동 시간</label>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <input
              type="number"
              min="0"
              value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
              className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">시</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="59"
              value={form.minutes}
              onChange={(e) => set("minutes", e.target.value)}
              className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">분</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="59"
              value={form.seconds}
              onChange={(e) => set("seconds", e.target.value)}
              className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">초</span>
          </div>
        </div>
      </div>

      {/* 페이스 */}
      <div className="bg-sky-50 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">평균 페이스 (자동 계산)</span>
        <span className="text-sm font-bold text-sky-600">
          {pacePreview ? `${pacePreview} min/km` : "-"}
        </span>
      </div>

      {/* 선택 항목 */}
      <div className="border-t border-sky-100 pt-4">
        <p className="text-xs text-gray-400 mb-3">선택 항목</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="number"
              placeholder="케이던시"
              value={form.cadence}
              onChange={(e) => set("cadence", e.target.value)}
              className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">spm</span>
          </div>
          <div className="relative">
            <input
              type="number"
              placeholder="심박수"
              value={form.heart_rate}
              onChange={(e) => set("heart_rate", e.target.value)}
              className="w-full border border-sky-100 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">bpm</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold rounded-xl py-3 transition"
      >
        {loading ? "저장 중..." : "수정 저장"}
      </button>
    </form>
  );
}
