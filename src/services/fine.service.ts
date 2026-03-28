import { createClient } from "@/lib/supabase/server";
import type { Fine, Profile } from "@/types";

export interface FineData {
  fines: Fine[];
  profiles: Profile[];
  totalAmount: number;
}

export async function getFines(): Promise<FineData> {
  const supabase = await createClient();

  const { data: fines } = await supabase
    .from("fines")
    .select("id, user_id, year, month, amount, reason, created_at, profiles(name)")
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name");

  const totalAmount = (fines ?? []).reduce((sum, f) => sum + f.amount, 0);

  return {
    fines: (fines ?? []) as Fine[],
    profiles: profiles ?? [],
    totalAmount,
  };
}
