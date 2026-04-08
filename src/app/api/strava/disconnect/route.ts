import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/strava/disconnect — Strava 연결 해제
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("strava_connections")
    .delete()
    .eq("user_id", session.user.id);

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/users/${session.user.id}?strava=disconnected`);
}
