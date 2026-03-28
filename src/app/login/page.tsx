import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/auth/LoginButton";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-cyan-50 to-white">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">🏃</span>
          <h1 className="text-2xl font-bold text-sky-600">Running Mileage</h1>
          <p className="text-sm text-gray-400">씨벤티지 러닝크루 마일리지 트래커</p>
        </div>
        <LoginButton />
      </div>
    </main>
  );
}
