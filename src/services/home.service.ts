import { createClient } from "@/lib/supabase/server";
import type { Ranking } from "@/types";

export interface HomeData {
  rankings: Ranking[];
  weekTotalDistance: number;
  weekUploadCount: number;
  topWeekUser: string;
  currentMonthLabel: string;
}

export async function getHomeData(): Promise<HomeData> {
  const supabase = await createClient();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // 이번 주 월요일 ~ 일요일
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const weekStart = monday.toISOString().split("T")[0];
  const weekEnd = sunday.toISOString().split("T")[0];

  const firstDayOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  const lastDayOfMonthStr = `${year}-${String(month).padStart(2, "0")}-${lastDayOfMonth}`;

  // 이번 달 러닝 기록 (유저 정보 포함)
  const { data: monthRecords } = await supabase
    .from("running_records")
    .select("user_id, distance, date, profiles(name)")
    .gte("date", firstDayOfMonth)
    .lte("date", lastDayOfMonthStr);

  // 전체 러닝 기록 (이번 주 요약용)
  const { data: allRecords } = await supabase
    .from("running_records")
    .select("user_id, distance, date");

  // 이번 달 목표
  const { data: goals } = await supabase
    .from("monthly_goals")
    .select("user_id, target_distance")
    .eq("year", year)
    .eq("month", month);

  // 전체 프로필
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name");

  // 이번 주 기록
  const weekRecords = (allRecords ?? []).filter(
    (r) => r.date >= weekStart && r.date <= weekEnd
  );

  // 유저별 이번 달 마일리지 계산
  const mileageMap: Record<string, { name: string; total: number }> = {};
  for (const r of monthRecords ?? []) {
    if (!mileageMap[r.user_id]) {
      mileageMap[r.user_id] = {
        name: (r.profiles as unknown as { name: string } | null)?.name ?? "Unknown",
        total: 0,
      };
    }
    mileageMap[r.user_id].total += Number(r.distance);
  }

  // 랭킹 (이번 달 마일리지 순)
  const rankings: Ranking[] = Object.entries(mileageMap)
    .map(([userId, { name, total }]) => {
      const goal = goals?.find((g) => g.user_id === userId);
      const achievement = goal
        ? Math.min(Math.round((total / goal.target_distance) * 100), 100)
        : null;
      return { userId, name, total, achievement };
    })
    .sort((a, b) => b.total - a.total);

  // 기록 없는 유저도 랭킹에 포함
  for (const p of profiles ?? []) {
    if (!mileageMap[p.id]) {
      const goal = goals?.find((g) => g.user_id === p.id);
      rankings.push({
        userId: p.id,
        name: p.name,
        total: 0,
        achievement: goal ? 0 : null,
      });
    }
  }

  // 이번 주 요약
  const weekTotalDistance = weekRecords.reduce(
    (sum, r) => sum + Number(r.distance),
    0
  );
  const weekUploadCount = weekRecords.length;

  const weekUserMap: Record<string, number> = {};
  for (const r of weekRecords) {
    weekUserMap[r.user_id] = (weekUserMap[r.user_id] ?? 0) + Number(r.distance);
  }
  const topWeekUserId = Object.entries(weekUserMap).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0];
  const topWeekUser = profiles?.find((p) => p.id === topWeekUserId)?.name ?? "-";
  const currentMonthLabel = `${year}년 ${month}월`;

  return { rankings, weekTotalDistance, weekUploadCount, topWeekUser, currentMonthLabel };
}
