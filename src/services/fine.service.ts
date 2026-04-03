import { createClient } from "@/lib/supabase/server";
import type { Fine, FineConfig, Profile } from "@/types";

export interface FineData {
  fines: Fine[];
  profiles: Profile[];
  totalAmount: number;
  fineSubjectIds: string[];
  fineConfig: FineConfig;
}

export async function getFines(): Promise<FineData> {
  const supabase = await createClient();

  const [{ data: fines }, { data: profiles }, { data: subjects }, { data: config }] =
    await Promise.all([
      supabase
        .from("fines")
        .select("id, user_id, year, month, amount, reason, created_at, profiles(name)")
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase.from("profiles").select("id, name"),
      supabase.from("fine_subjects").select("user_id"),
      supabase.from("fine_config").select("*").eq("id", 1).single(),
    ]);

  const totalAmount = (fines ?? []).reduce((sum, f) => sum + f.amount, 0);
  const fineSubjectIds = (subjects ?? []).map((s) => s.user_id);
  const fineConfig: FineConfig = config ?? { id: 1, amount: 10000, updated_at: new Date().toISOString() };

  return {
    fines: (fines ?? []) as Fine[],
    profiles: profiles ?? [],
    totalAmount,
    fineSubjectIds,
    fineConfig,
  };
}

// 이전 달 벌금 자동 부과 (목표 미달 대상자에게만)
export async function autoGenerateFines(): Promise<{ generated: number }> {
  const supabase = await createClient();

  const now = new Date();
  let prevYear = now.getFullYear();
  let prevMonth = now.getMonth(); // getMonth()는 0-based, 0이면 이전 해 12월
  if (prevMonth === 0) {
    prevYear -= 1;
    prevMonth = 12;
  }

  const [{ data: subjects }, { data: config }] = await Promise.all([
    supabase.from("fine_subjects").select("user_id"),
    supabase.from("fine_config").select("amount").eq("id", 1).single(),
  ]);

  if (!subjects || subjects.length === 0 || !config) return { generated: 0 };

  const fineAmount = config.amount;
  const firstDay = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(prevYear, prevMonth, 0).getDate();
  const lastDayStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${lastDay}`;

  let generated = 0;

  for (const { user_id } of subjects) {
    // 이미 자동 부과된 벌금이 있는지 확인
    const { data: existing } = await supabase
      .from("fines")
      .select("id")
      .eq("user_id", user_id)
      .eq("year", prevYear)
      .eq("month", prevMonth)
      .eq("reason", "목표 미달 자동 부과")
      .maybeSingle();

    if (existing) continue;

    // 해당 월 목표 조회
    const { data: goal } = await supabase
      .from("monthly_goals")
      .select("target_distance")
      .eq("user_id", user_id)
      .eq("year", prevYear)
      .eq("month", prevMonth)
      .maybeSingle();

    if (!goal) continue; // 목표 없으면 벌금 없음

    // 해당 월 실제 거리 합계
    const { data: records } = await supabase
      .from("running_records")
      .select("distance")
      .eq("user_id", user_id)
      .gte("date", firstDay)
      .lte("date", lastDayStr);

    const totalDistance = (records ?? []).reduce((sum, r) => sum + Number(r.distance), 0);

    if (totalDistance >= goal.target_distance) continue; // 목표 달성

    // 벌금 자동 부과
    const { error } = await supabase.from("fines").insert({
      user_id,
      year: prevYear,
      month: prevMonth,
      amount: fineAmount,
      reason: "목표 미달 자동 부과",
    });

    if (!error) generated++;
  }

  return { generated };
}
