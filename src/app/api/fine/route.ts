import { NextRequest, NextResponse } from "next/server";

// GET /api/fine - 벌금 내역 조회
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "TODO: get fines" });
}

// POST /api/fine - 벌금 등록 (관리자 전용)
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: "TODO: create fine" });
}
