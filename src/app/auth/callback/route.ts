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
      // Detect whether this auth came from an OAuth provider (Google etc.)
      // or from email/password. We trust user_metadata.role only for email
      // signups — for OAuth, the only reliable signal is the cookie we set
      // right before signInWithOAuth (user_metadata can be stale from a
      // previous email signup attempt with the same address).
      const provider = data.user.app_metadata?.provider;
      const isOAuthSignup = provider !== undefined && provider !== "email";

      let intendedRole: "candidate" | "employer" | undefined;
      if (isOAuthSignup) {
        if (roleParam === "employer" || roleParam === "candidate") {
          intendedRole = roleParam;
        }
      } else {
        const metaRole = data.user.user_metadata?.role;
        if (metaRole === "employer" || metaRole === "candidate") {
          intendedRole = metaRole;
        }
      }

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
