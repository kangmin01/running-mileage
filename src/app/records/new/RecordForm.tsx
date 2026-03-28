"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  today: string;
}

export default function RecordForm({ userId, today }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: today,
    distance: "",
    hours: "0",
    minutes: "",
    seconds: "0",
    cadence: "",
    heart_rate: "",
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 페이스 자동 계산 (분/km)
  const calcPace = () => {
    const dist = parseFloat(form.distance);
    const totalSec =
      parseInt(form.hours || "0") * 3600 +
      parseInt(form.minutes || "0") * 60 +
      parseInt(form.seconds || "0");
    if (!dist || dist <= 0 || !totalSec) return null;
    const paceSecPerKm = totalSec / dist;
    return Math.round(paceSecPerKm / 6) / 10; // 분/km (소수 1자리)
  };

  const pacePreview = calcPace();

  const totalMinutes = () => {
    return (
      parseInt(form.hours || "0") * 60 + parseInt(form.minutes || "0") +
      Math.round(parseInt(form.seconds || "0") / 60)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dist = parseFloat(form.distance);
    const duration = totalMinutes();
    const pace = calcPace();

    if (!form.date) return setError("날짜를 입력해주세요.");
    if (!dist || dist <= 0) return setError("거리를 입력해주세요.");
    if (duration <= 0) return setError("운동 시간을 입력해주세요.");
    if (!pace) return setError("페이스를 계산할 수 없어요.");

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("running_records")
      .insert({
        user_id: userId,
        date: form.date,
        distance: dist,
        duration,
        pace,
        cadence: form.cadence ? parseInt(form.cadence) : null,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate) : null,
      })
      .select("id")
      .single();

    setLoading(false);

    if (err || !data) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    // 디스코드 알림
    await fetch("/api/records/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, distance: dist }),
    });

    router.push(`/users/${userId}`);
    router.refresh();
  };

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
            placeholder="0.00"
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
              placeholder="0"
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
              placeholder="00"
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
              placeholder="00"
              value={form.seconds}
              onChange={(e) => set("seconds", e.target.value)}
              className="w-full border border-sky-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">초</span>
          </div>
        </div>
      </div>

      {/* 평균 페이스 (자동 계산) */}
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
        {loading ? "저장 중..." : "기록 저장"}
      </button>
    </form>
  );
}
