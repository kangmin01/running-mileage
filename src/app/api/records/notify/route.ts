import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendDiscordNotification } from "@/lib/discord";

export async function POST(request: NextRequest) {
  const { userId, distance } = await request.json();

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (profile) {
    await sendDiscordNotification(
      `🏃 ${profile.name}가 ${distance}km 러닝을 기록했습니다!`
    );
  }

  return NextResponse.json({ ok: true });
}
