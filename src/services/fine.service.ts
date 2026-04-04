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
  const now = new Date();

  // 매 달 1~7일 사이에만 실행
  if (now.getDate() > 7) return { generated: 0 };

  const supabase = await createClient();
  let prevYear = now.getFullYear();
  let prevMonth = now.getMonth();
  if (prevMonth === 0) {
    prevYear -= 1;
    prevMonth = 12;
  }

  const firstDay = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const lastDayStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${new Date(prevYear, prevMonth, 0).getDate()}`;

  // 필요한 데이터 병렬 조회
  const [{ data: subjects }, { data: config }, { data: existingFines }, { data: goals }, { data: records }] =
    await Promise.all([
      supabase.from("fine_subjects").select("user_id"),
      supabase.from("fine_config").select("amount").eq("id", 1).single(),
      supabase
        .from("fines")
        .select("user_id")
        .eq("year", prevYear)
        .eq("month", prevMonth)
        .eq("reason", "목표 미달 자동 부과"),
      supabase
        .from("monthly_goals")
        .select("user_id, target_distance")
        .eq("year", prevYear)
        .eq("month", prevMonth),
      supabase
        .from("running_records")
        .select("user_id, distance")
        .gte("date", firstDay)
        .lte("date", lastDayStr),
    ]);

  if (!subjects || subjects.length === 0 || !config) return { generated: 0 };

  const fineAmount = config.amount;
  const alreadyFined = new Set((existingFines ?? []).map((f) => f.user_id));
  const goalMap = new Map((goals ?? []).map((g) => [g.user_id, g.target_distance]));

  const distanceMap = new Map<string, number>();
  for (const r of records ?? []) {
    distanceMap.set(r.user_id, (distanceMap.get(r.user_id) ?? 0) + Number(r.distance));
  }

  let generated = 0;
  for (const { user_id } of subjects) {
    if (alreadyFined.has(user_id)) continue;
    const target = goalMap.get(user_id);
    if (!target) continue;
    const actual = distanceMap.get(user_id) ?? 0;
    if (actual >= target) continue;

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
