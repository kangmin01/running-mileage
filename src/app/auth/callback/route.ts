import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

    // 프로필이 없으면 생성 (트리거 누락 방지)
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: session.user.id,
          name:
            session.user.user_metadata?.full_name ??
            session.user.email ??
            "Unknown",
          role: "member",
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
