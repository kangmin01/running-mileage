"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { revalidateRecord } from "@/actions/cache";

interface Props {
  recordId: string;
  userId: string;
}

export default function DeleteButton({ recordId, userId }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.from("running_records").delete().eq("id", recordId);
    await revalidateRecord(userId);
    router.push(`/users/${userId}`);
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-gray-400 px-3 py-1 rounded-full border border-gray-200"
        >
          취소
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-white bg-red-400 hover:bg-red-500 px-3 py-1 rounded-full transition"
        >
          {loading ? "삭제 중..." : "삭제 확인"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-red-400 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50 transition"
    >
      삭제
    </button>
  );
}
