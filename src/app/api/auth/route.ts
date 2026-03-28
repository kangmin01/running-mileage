import { NextRequest, NextResponse } from "next/server";

// POST /api/auth - Supabase 콜백 처리용 (필요시 확장)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "TODO: auth callback" });
}
