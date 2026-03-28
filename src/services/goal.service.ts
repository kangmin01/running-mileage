import { createClient } from "@/lib/supabase/server";

export interface GoalData {
  goal: { id: string; target_distance: number } | null;
  profile: { name: string } | null;
}

export async function getGoal(
  userId: string,
  year: number,
  month: number
): Promise<GoalData> {
  const supabase = await createClient();

  const [{ data: profile }, { data: goal }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).single(),
    supabase
      .from("monthly_goals")
      .select("id, target_distance")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month)
      .maybeSingle(),
  ]);

  return {
    goal: goal ?? null,
    profile: profile ?? null,
  };
}
