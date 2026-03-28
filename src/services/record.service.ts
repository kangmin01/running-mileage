import { createClient } from "@/lib/supabase/server";

export async function getRecord(id: string) {
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("running_records")
    .select("*")
    .eq("id", id)
    .single();

  return record;
}
