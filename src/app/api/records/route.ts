import { NextRequest, NextResponse } from "next/server";

// GET /api/records - 기록 목록 조회
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "TODO: get records" });
}

// POST /api/records - 기록 생성
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "TODO: create record" });
}
