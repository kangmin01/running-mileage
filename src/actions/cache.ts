"use server";

import { revalidateTag } from "next/cache";

export async function revalidateHome() {
  revalidateTag("home", "max");
}

export async function revalidateFines() {
  revalidateTag("fines", "max");
}

export async function revalidateUser(userId: string) {
  revalidateTag(`user-${userId}`, "max");
}

// 기록 변경: 홈(랭킹) + 해당 유저 둘 다 무효화
export async function revalidateRecord(userId: string) {
  revalidateTag("home", "max");
  revalidateTag(`user-${userId}`, "max");
}

// 벌금 대상자/설정 변경: 벌금 + 홈(🔥 이모지) 둘 다 무효화
export async function revalidateFineAndHome() {
  revalidateTag("fines", "max");
  revalidateTag("home", "max");
}
