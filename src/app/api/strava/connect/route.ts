import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/strava/connect — Strava OAuth 시작
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.redirect(new URL("/login", request.url));

  const { origin } = new URL(request.url);
  const callbackUrl = `${origin}/api/strava/callback`;

  const stravaAuthUrl = new URL("https://www.strava.com/oauth/authorize");
  stravaAuthUrl.searchParams.set("client_id", process.env.STRAVA_CLIENT_ID!);
  stravaAuthUrl.searchParams.set("redirect_uri", callbackUrl);
  stravaAuthUrl.searchParams.set("response_type", "code");
  stravaAuthUrl.searchParams.set("approval_prompt", "auto");
  stravaAuthUrl.searchParams.set("scope", "activity:read_all");

  return NextResponse.redirect(stravaAuthUrl);
}
