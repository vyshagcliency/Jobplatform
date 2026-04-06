import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // The signup page sets `pending_oauth_role` before triggering OAuth so we
  // can recover the intended role here. Fall back to the legacy ?role= query
  // param for any in-flight requests started before this change shipped.
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get("pending_oauth_role")?.value;
  const roleParam = cookieRole ?? searchParams.get("role");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // The trigger that creates `profiles` defaults role to 'candidate' when
      // raw_user_meta_data.role is missing — which is always the case for
      // OAuth signups (we can't pass user metadata through signInWithOAuth).
      // For email/password signups we DO set role in raw_user_meta_data, so
      // those are always trustworthy.
      const metadataRole = data.user.user_metadata?.role as
        | "candidate"
        | "employer"
        | undefined;
      const intendedRole =
        metadataRole ??
        (roleParam === "employer" || roleParam === "candidate"
          ? roleParam
          : undefined);

      if (intendedRole) {
        await supabase
          .from("profiles")
          .update({ role: intendedRole })
          .eq("id", data.user.id);
      }

      // Clear the cookie now that we've consumed it.
      if (cookieRole) {
        cookieStore.set("pending_oauth_role", "", { path: "/", maxAge: 0 });
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

      // If no profile exists yet (trigger may be delayed), redirect to onboarding.
      if (!profile) {
        if (intendedRole) {
          return NextResponse.redirect(`${origin}/onboarding/${intendedRole}`);
        }
        return NextResponse.redirect(`${origin}/onboarding/role-select`);
      }

      if (profile.eligibility === "ineligible") {
        return NextResponse.redirect(`${origin}/blocked`);
      }

      // OAuth signup with no reliable role signal AND onboarding not done →
      // ask the user to pick. This handles the cross-domain case where the
      // pending_oauth_role cookie was lost during Supabase's Site URL fallback.
      if (
        !intendedRole &&
        profile.onboarding_status !== "completed"
      ) {
        return NextResponse.redirect(`${origin}/onboarding/role-select`);
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
