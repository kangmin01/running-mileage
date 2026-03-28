"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface UseGoalFormOptions {
  userId: string;
  year: number;
  month: number;
  currentGoal: number | null;
  isLocked: boolean;
}

export function useGoalForm({
  userId,
  year,
  month,
  currentGoal,
  isLocked,
}: UseGoalFormOptions) {
  const router = useRouter();
  const [distance, setDistance] = useState(currentGoal?.toString() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const value = parseFloat(distance);
    if (isNaN(value) || value <= 0) {
      setError("올바른 거리를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: err } = await supabase
      .from("monthly_goals")
      .upsert(
        { user_id: userId, year, month, target_distance: value },
        { onConflict: "user_id,year,month" }
      );

    setLoading(false);

    if (err) {
      setError("저장에 실패했어요. 다시 시도해주세요.");
      return;
    }

    router.push(`/users/${userId}`);
    router.refresh();
  };

  return { distance, setDistance, loading, error, handleSubmit };
}
