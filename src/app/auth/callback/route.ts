import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const roleParam = searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // For Google OAuth signups, the trigger defaults role to 'candidate'.
      // If the user signed up from the employer signup page, update the role.
      if (roleParam === "employer" || roleParam === "candidate") {
        await supabase
          .from("profiles")
          .update({ role: roleParam })
          .eq("id", data.user.id);
      }

      // Also sync full_name from Google if the profile name is empty
      const googleName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        "";
      if (googleName) {
        await supabase
          .from("profiles")
          .update({ full_name: googleName })
          .eq("id", data.user.id)
          .is("full_name", null);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_status, eligibility")
        .eq("id", data.user.id)
        .single();

      // If no profile exists yet (trigger may be delayed), redirect to onboarding
      if (!profile) {
        const fallbackRole = roleParam || "candidate";
        return NextResponse.redirect(
          `${origin}/onboarding/${fallbackRole}`
        );
      }

      if (profile.eligibility === "ineligible") {
        return NextResponse.redirect(`${origin}/blocked`);
      }

      if (
        profile.onboarding_status === "pending" ||
        profile.onboarding_status === "in_progress"
      ) {
        const dest =
          profile.role === "employer"
            ? "/onboarding/employer"
            : "/onboarding/candidate";
        return NextResponse.redirect(`${origin}${dest}`);
      }

      const dest =
        profile.role === "employer" ? "/dashboard/employer" : "/jobs";
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  // Something went wrong — send back to login with an error hint
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
