"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import MonthCalendar from "@/components/users/MonthCalendar";
import Link from "next/link";

interface MonthRecord {
  id: string;
  date: string;
  distance: number;
  duration: number;
  pace: number;
}

interface Props {
  userId: string;
  isOwner: boolean;
  initialYear: number;
  initialMonth: number;
  initialRecords: MonthRecord[];
  initialGoal: { target_distance: number } | null;
  totalDistance: number;
}

export default function MonthDashboard({
  userId,
  isOwner,
  initialYear,
  initialMonth,
  initialRecords,
  initialGoal,
  totalDistance,
}: Props) {
  const now = new Date();
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [records, setRecords] = useState<MonthRecord[]>(initialRecords);
  const [goal, setGoal] = useState<{ target_distance: number } | null>(initialGoal);
  const [loading, setLoading] = useState(false);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const supabase = createClient();
    const firstDay = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const lastDayStr = `${y}-${String(m).padStart(2, "0")}-${lastDay}`;

    const [{ data: recs }, { data: g }] = await Promise.all([
      supabase
        .from("running_records")
        .select("id, date, distance, duration, pace")
        .eq("user_id", userId)
        .gte("date", firstDay)
        .lte("date", lastDayStr)
        .order("date", { ascending: false }),
      supabase
        .from("monthly_goals")
        .select("target_distance")
        .eq("user_id", userId)
        .eq("year", y)
        .eq("month", m)
        .maybeSingle(),
    ]);

    setRecords((recs ?? []) as MonthRecord[]);
    setGoal(g ?? null);
    setLoading(false);
  }, [userId]);

  const goMonth = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    fetchMonth(y, m);
  };

  const prev = () => {
    if (month === 1) goMonth(year - 1, 12);
    else goMonth(year, month - 1);
  };

  const next = () => {
    if (month === 12) goMonth(year + 1, 1);
    else goMonth(year, month + 1);
  };

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const monthDistance = records.reduce((sum, r) => sum + Number(r.distance), 0);
  const achievement = goal
    ? Math.min(Math.round((monthDistance / goal.target_distance) * 100), 100)
    : null;

  return (
    <>
      {/* 월별 요약 카드 */}
      <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="text-sky-400 hover:text-sky-600 transition text-xl leading-none"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-sky-500 min-w-[80px] text-center">
              {year}년 {month}월
            </span>
            <button
              onClick={next}
              disabled={isCurrentMonth}
              className="text-sky-400 hover:text-sky-600 disabled:text-gray-200 transition text-xl leading-none"
            >
              ›
            </button>
          </div>
          {isOwner && (
            <Link
              href={`/users/${userId}/goal`}
              className="text-xs text-sky-400 border border-sky-200 rounded-full px-3 py-1 hover:bg-sky-50 transition"
            >
              목표 설정
            </Link>
          )}
        </div>

        <div className={`grid grid-cols-3 gap-3 mb-4 transition-opacity ${loading ? "opacity-40" : ""}`}>
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">이번 달</p>
            <p className="text-lg font-bold text-sky-700">
              {monthDistance.toFixed(1)}
              <span className="text-xs font-normal ml-1">km</span>
            </p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">총 누적</p>
            <p className="text-lg font-bold text-indigo-600">
              {totalDistance.toFixed(1)}
              <span className="text-xs font-normal ml-1">km</span>
            </p>
          </div>
          <div className="bg-sky-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">월 목표</p>
            <p className="text-lg font-bold text-sky-700">
              {goal ? `${goal.target_distance}km` : "미설정"}
            </p>
          </div>
        </div>

        {achievement !== null && (
          <div className={`transition-opacity ${loading ? "opacity-40" : ""}`}>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>목표 달성률</span>
              <span>{achievement}%</span>
            </div>
            <div className="h-2 bg-sky-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all"
                style={{ width: `${achievement}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* 달력 */}
      <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
        <h2 className="text-sm font-semibold text-sky-500 mb-3">
          {year}년 {month}월 기록
        </h2>
        <div className={`transition-opacity ${loading ? "opacity-40" : ""}`}>
          <MonthCalendar records={records} year={year} month={month} />
        </div>
      </section>

      {/* 기록 리스트 */}
      {records.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <h2 className="text-sm font-semibold text-sky-500 mb-3">기록 목록</h2>
          <div className={`flex flex-col gap-2 transition-opacity ${loading ? "opacity-40" : ""}`}>
            {records.map((r) => (
              <Link
                key={r.id}
                href={`/records/${r.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-sky-50 transition"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-700">{r.date}</p>
                  <p className="text-xs text-gray-400">{r.duration}분 · {r.pace} min/km</p>
                </div>
                <p className="text-sm font-bold text-sky-600">{Number(r.distance).toFixed(1)} km</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {records.length === 0 && !loading && (
        <section className="bg-white rounded-2xl shadow-sm border border-sky-100 p-5">
          <p className="text-sm text-gray-400 text-center py-4">이 달의 기록이 없어요</p>
        </section>
      )}
    </>
  );
}
