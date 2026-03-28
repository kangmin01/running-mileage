import { NextRequest, NextResponse } from "next/server";

// PATCH /api/records/[id] - 기록 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ message: `TODO: update record ${id}` });
}

// DELETE /api/records/[id] - 기록 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ message: `TODO: delete record ${id}` });
}
