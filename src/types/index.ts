export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  created_at: string;
}

export interface RunningRecord {
  id: string;
  user_id: string;
  date: string;
  distance: number;       // km
  duration: number;       // 분
  pace: number;           // 자동 계산 (분/km)
  cadence?: number;
  heart_rate?: number;
  segment_image_url?: string;
  map_image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  year: number;
  month: number;
  target_distance: number; // km
  created_at: string;
}

export interface Fine {
  id: string;
  user_id: string;
  year: number;
  month: number;
  amount: number;
  reason: string | null;
  created_at: string;
  profiles: { name: string }[] | null;
}

export interface Badge {
  id: string;
  user_id: string;
  type: string;
  description: string;
  awarded_at: string;
}

export interface Profile {
  id: string;
  name: string;
}

export interface FineSubject {
  user_id: string;
  created_at: string;
}

export interface StravaConnection {
  user_id: string;
  strava_athlete_id: number;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  created_at: string;
}

export interface FineConfig {
  id: number;
  amount: number;
  updated_at: string;
}

export interface Ranking {
  userId: string;
  name: string;
  total: number;
  achievement: number | null;
}
