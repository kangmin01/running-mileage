import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchStravaActivity, convertStravaActivity } from "@/lib/strava";
import { getStravaAccessToken } from "@/lib/strava";

// GET /api/strava/webhook — Strava 웹훅 구독 인증
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST /api/strava/webhook — Strava 활동 이벤트 수신
export async function POST(request: NextRequest) {
  const event = await request.json();

  // 달리기 활동 생성 이벤트만 처리
  if (event.object_type !== "activity" || event.aspect_type !== "create") {
    return NextResponse.json({ ok: true });
  }

  const activityId: number = event.object_id;
  const stravaAthleteId: number = event.owner_id;

  const supabase = createAdminClient();

  // 어떤 유저인지 찾기
  const { data: conn } = await supabase
    .from("strava_connections")
    .select("user_id")
    .eq("strava_athlete_id", stravaAthleteId)
    .single();

  if (!conn) return NextResponse.json({ ok: true });

  const userId: string = conn.user_id;

  // 중복 확인
  const { data: existing } = await supabase
    .from("running_records")
    .select("id")
    .eq("strava_activity_id", activityId)
    .single();

  if (existing) return NextResponse.json({ ok: true });

  // 토큰 갱신 후 활동 상세 조회
  const accessToken = await getStravaAccessToken(userId, supabase);
  if (!accessToken) return NextResponse.json({ ok: true });

  const activity = await fetchStravaActivity(activityId, accessToken);
  if (!activity || activity.type !== "Run") return NextResponse.json({ ok: true });

  const { distKm, durationMin, pace, cadence, heartRate, date } =
    convertStravaActivity(activity);

  await supabase.from("running_records").insert({
    user_id: userId,
    date,
    distance: distKm,
    duration: durationMin,
    pace,
    cadence,
    heart_rate: heartRate,
    strava_activity_id: activityId,
  });

  revalidateTag("home", "max");
  revalidateTag(`user-${userId}`, "max");

  return NextResponse.json({ ok: true });
}
