"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 hover:text-gray-600 transition"
    >
      로그아웃
    </button>
  );
}
