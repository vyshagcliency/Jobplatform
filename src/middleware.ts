import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/", "/signup", "/verify-otp", "/blocked", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and onboarding
  if (
    publicRoutes.some((r) => pathname === r) ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check profile status
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_status, eligibility, role")
    .eq("id", user.id)
    .single();

  // If profile fetch fails or doesn't exist, redirect to onboarding
  // (prevents bypassing onboarding due to RLS/network errors)
  if (profileError || !profile) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding/candidate";
    return NextResponse.redirect(url);
  }

  if (profile.eligibility === "ineligible") {
    const url = request.nextUrl.clone();
    url.pathname = "/blocked";
    return NextResponse.redirect(url);
  }

  if (
    profile.onboarding_status === "pending" ||
    profile.onboarding_status === "in_progress"
  ) {
    const url = request.nextUrl.clone();
    url.pathname =
      profile.role === "employer"
        ? "/onboarding/employer"
        : "/onboarding/candidate";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
