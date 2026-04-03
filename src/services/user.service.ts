import { createClient } from "@/lib/supabase/server";

export interface UserData {
  profile: { id: string; name: string };
  goal: { target_distance: number } | null;
  monthRecords: {
    id: string;
    date: string;
    distance: number;
    duration: number;
    pace: number;
  }[];
  totalDistance: number;
  monthDistance: number;
  achievement: number | null;
  badges: {
    id: string;
    type: string;
    description: string | null;
    awarded_at: string;
  }[];
  year: number;
  month: number;
}

export async function getUserData(
  userId: string,
  targetYear?: number,
  targetMonth?: number,
): Promise<UserData | null> {
  const supabase = await createClient();

  const now = new Date();
  const year = targetYear ?? now.getFullYear();
  const month = targetMonth ?? now.getMonth() + 1;

  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const [{ data: profile }, { data: goal }, { data: monthRecords }, { data: allRecords }, { data: badges }] =
    await Promise.all([
      supabase.from("profiles").select("id, name").eq("id", userId).single(),
      supabase
        .from("monthly_goals")
        .select("target_distance")
        .eq("user_id", userId)
        .eq("year", year)
        .eq("month", month)
        .maybeSingle(),
      supabase
        .from("running_records")
        .select("id, date, distance, duration, pace")
        .eq("user_id", userId)
        .gte("date", firstDay)
        .lte("date", lastDayStr)
        .order("date", { ascending: false }),
      supabase
        .from("running_records")
        .select("distance")
        .eq("user_id", userId),
      supabase
        .from("badges")
        .select("id, type, description, awarded_at")
        .eq("user_id", userId)
        .order("awarded_at", { ascending: false }),
    ]);

  if (!profile) return null;

  const totalDistance = (allRecords ?? []).reduce(
    (sum, r) => sum + Number(r.distance),
    0
  );
  const monthDistance = (monthRecords ?? []).reduce(
    (sum, r) => sum + Number(r.distance),
    0
  );
  const achievement = goal
    ? Math.min(Math.round((monthDistance / goal.target_distance) * 100), 100)
    : null;

  return {
    profile,
    goal,
    monthRecords: (monthRecords ?? []) as UserData["monthRecords"],
    totalDistance,
    monthDistance,
    achievement,
    badges: badges ?? [],
    year,
    month,
  };
}
