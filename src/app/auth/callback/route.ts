import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_status, eligibility")
        .eq("id", data.user.id)
        .single();

      if (profile?.eligibility === "ineligible") {
        return NextResponse.redirect(`${origin}/blocked`);
      }

      if (
        profile?.onboarding_status === "pending" ||
        profile?.onboarding_status === "in_progress"
      ) {
        const dest =
          profile.role === "employer"
            ? "/onboarding/employer"
            : "/onboarding/candidate";
        return NextResponse.redirect(`${origin}${dest}`);
      }

      const dest =
        profile?.role === "employer" ? "/dashboard/employer" : "/jobs";
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
