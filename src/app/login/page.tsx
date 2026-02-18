"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const F = {
  display: "var(--font-display), sans-serif",
  body: "var(--font-sans), sans-serif",
} as const;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_status, eligibility")
        .eq("id", user.id)
        .single();

      if (profile?.eligibility === "ineligible") {
        router.push("/blocked");
      } else if (profile?.onboarding_status === "pending" || profile?.onboarding_status === "in_progress") {
        router.push(profile.role === "employer" ? "/onboarding/employer" : "/onboarding/candidate");
      } else {
        router.push(profile?.role === "employer" ? "/dashboard/employer" : "/jobs");
      }
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
      }}
    >
      {/* Left panel — brand (hidden on mobile) */}
      <div
        className="hidden lg:flex"
        style={{
          width: "420px",
          flexShrink: 0,
          backgroundColor: "#F5F3ED",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem 3rem",
          borderRight: "1px solid #E8E5DC",
        }}
      >
        {/* Brand mark */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
            <rect width="30" height="30" rx="7" fill="#BBFF3B" />
            <path d="M15 21 L15 9" stroke="#0C0E13" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M10.5 14 L15 9 L19.5 14" stroke="#0C0E13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11.5 19.5 L18.5 19.5" stroke="#0C0E13" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: "1rem", color: "#1C1C1A" }}>
            Culture Hires
          </span>
        </Link>

        {/* Mid content */}
        <div>
          <p style={{ fontFamily: F.display, fontSize: "1.5rem", fontWeight: 800, color: "#1C1C1A", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: "2rem" }}>
            Your next opportunity is waiting.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              "100% paid roles — no free labour",
              "AI matched to your strengths",
              "Zero IIT/NIT gatekeeping",
            ].map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <span
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: "#BBFF3B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#0C0E13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ fontFamily: F.body, fontSize: "0.875rem", color: "#4A4A45", lineHeight: 1.5 }}>
                  {point}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: "#9C9C94" }}>
          Built for Tier-2 &amp; Tier-3 freshers
        </p>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1.5rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom: "2rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
              <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                <rect width="30" height="30" rx="7" fill="#BBFF3B" />
                <path d="M15 21 L15 9" stroke="#0C0E13" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M10.5 14 L15 9 L19.5 14" stroke="#0C0E13" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.5 19.5 L18.5 19.5" stroke="#0C0E13" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: "0.95rem", color: "#1C1C1A" }}>Culture Hires</span>
            </Link>
          </div>

          <h1 style={{ fontFamily: F.display, fontSize: "1.625rem", fontWeight: 800, color: "#1C1C1A", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "#6B6B6B", marginBottom: "2rem" }}>
            Log in to your Culture Hires account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label htmlFor="email" style={{ display: "block", fontFamily: F.body, fontSize: "0.8125rem", fontWeight: 600, color: "#1C1C1A", marginBottom: "0.4rem" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1.5px solid #E5E4DC",
                  borderRadius: "8px",
                  padding: "0.7rem 0.875rem",
                  fontFamily: F.body,
                  fontSize: "0.9rem",
                  color: "#1C1C1A",
                  outline: "none",
                  backgroundColor: "#FAFAF8",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#BBFF3B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E4DC")}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: "block", fontFamily: F.body, fontSize: "0.8125rem", fontWeight: 600, color: "#1C1C1A", marginBottom: "0.4rem" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1.5px solid #E5E4DC",
                  borderRadius: "8px",
                  padding: "0.7rem 0.875rem",
                  fontFamily: F.body,
                  fontSize: "0.9rem",
                  color: "#1C1C1A",
                  outline: "none",
                  backgroundColor: "#FAFAF8",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#BBFF3B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E4DC")}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "7px", padding: "0.625rem 0.875rem", fontFamily: F.body, fontSize: "0.8125rem", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#d4e87a" : "#BBFF3B",
                color: "#0C0E13",
                border: "none",
                borderRadius: "8px",
                padding: "0.8125rem",
                fontFamily: F.body,
                fontSize: "0.9375rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: "0.25rem",
                transition: "background-color 0.15s",
              }}
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
          </form>

          <p style={{ fontFamily: F.body, fontSize: "0.8125rem", color: "#6B6B6B", textAlign: "center", marginTop: "1.5rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup?role=candidate" style={{ color: "#1C1C1A", fontWeight: 600, textDecoration: "underline", textDecorationColor: "#BBFF3B", textUnderlineOffset: "3px" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
