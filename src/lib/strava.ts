import { SupabaseClient } from "@supabase/supabase-js";

export interface StravaActivity {
  id: number;
  type: string;       // deprecated but still returned
  sport_type: string; // 현재 기준 필드 (e.g. "Run", "TrailRun", "VirtualRun")
  name: string;
  distance: number;       // meters
  moving_time: number;    // seconds
  start_date_local: string;
  average_cadence?: number; // steps/min (one foot)
  average_heartrate?: number;
}

const RUN_SPORT_TYPES = new Set(["Run", "TrailRun", "VirtualRun"]);

export function isRunActivity(activity: StravaActivity): boolean {
  return RUN_SPORT_TYPES.has(activity.sport_type) || activity.type === "Run";
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function refreshStravaToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error("Strava token refresh failed");
  return res.json();
}

// 유효한 access_token 반환 (만료 시 자동 갱신)
export async function getStravaAccessToken(
  userId: string,
  supabase: SupabaseClient
): Promise<string | null> {
  const { data: conn } = await supabase
    .from("strava_connections")
    .select("access_token, refresh_token, token_expires_at")
    .eq("user_id", userId)
    .single();

  if (!conn) return null;

  const expiresAt = new Date(conn.token_expires_at).getTime();
  const now = Date.now();

  if (expiresAt > now + 60_000) {
    return conn.access_token;
  }

  // 토큰 갱신
  const tokens = await refreshStravaToken(conn.refresh_token);
  await supabase
    .from("strava_connections")
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(tokens.expires_at * 1000).toISOString(),
    })
    .eq("user_id", userId);

  return tokens.access_token;
}

export async function fetchStravaActivity(
  activityId: number,
  accessToken: string
): Promise<StravaActivity | null> {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

// Strava 단위 → DB 저장 단위로 변환
export function convertStravaActivity(activity: StravaActivity) {
  const distKm = Math.round((activity.distance / 1000) * 100) / 100;
  const durationSec = activity.moving_time;
  const durationMin = Math.round(durationSec / 60);
  // pace: min/km (소수점 한 자리)
  const pace = distKm > 0 ? Math.round((durationSec / distKm) / 6) / 10 : 0;
  // cadence: Strava는 한 발 기준 → 양발(spm)로 환산
  const cadence = activity.average_cadence
    ? Math.round(activity.average_cadence * 2)
    : null;
  const heartRate = activity.average_heartrate
    ? Math.round(activity.average_heartrate)
    : null;
  const date = activity.start_date_local.substring(0, 10);

  return { distKm, durationMin, pace, cadence, heartRate, date };
}
