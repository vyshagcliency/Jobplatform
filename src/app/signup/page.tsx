"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const F = {
  display: "var(--font-syne), sans-serif",
  body: "var(--font-dm-sans), sans-serif",
} as const;

const inputStyle: React.CSSProperties = {
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
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "employer" ? "employer" : "candidate";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const canSubmit = fullName.trim() && isEmailValid && isPasswordValid && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/verify-otp");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isEmployer = role === "employer";

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex" }}>

      {/* Left panel */}
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

        <div>
          <p style={{ fontFamily: F.display, fontSize: "1.5rem", fontWeight: 800, color: "#1C1C1A", lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: "2rem" }}>
            {isEmployer
              ? "Find candidates who fit your culture."
              : "Get hired for who you are."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {(isEmployer
              ? ["Access 500+ vetted freshers", "Culture-fit matching, not just skills", "Post jobs in under 2 minutes"]
              : ["100% paid roles — no free labour", "AI matched to your strengths", "Zero IIT/NIT gatekeeping"]
            ).map((point) => (
              <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                <span style={{ width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#BBFF3B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#0C0E13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ fontFamily: F.body, fontSize: "0.875rem", color: "#4A4A45", lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: F.body, fontSize: "0.78rem", color: "#9C9C94" }}>
          Built for Tier-2 &amp; Tier-3 freshers
        </p>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1.5rem", backgroundColor: "#ffffff" }}>
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

          {/* Role toggle */}
          <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#F5F3ED", borderRadius: "8px", padding: "0.25rem", marginBottom: "1.75rem" }}>
            {(["candidate", "employer"] as const).map((r) => (
              <Link
                key={r}
                href={`/signup?role=${r}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "0.5rem",
                  borderRadius: "6px",
                  fontFamily: F.body,
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  backgroundColor: role === r ? "#ffffff" : "transparent",
                  color: role === r ? "#1C1C1A" : "#6B6B6B",
                  boxShadow: role === r ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {r === "candidate" ? "Student" : "Employer"}
              </Link>
            ))}
          </div>

          <h1 style={{ fontFamily: F.display, fontSize: "1.625rem", fontWeight: 800, color: "#1C1C1A", letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>
            {isEmployer ? "Hire Freshers" : "Join as a Student"}
          </h1>
          <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "#6B6B6B", marginBottom: "1.875rem" }}>
            Create your account to get started.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <label htmlFor="fullName" style={{ display: "block", fontFamily: F.body, fontSize: "0.8125rem", fontWeight: 600, color: "#1C1C1A", marginBottom: "0.4rem" }}>
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#BBFF3B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E4DC")}
              />
            </div>

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
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#BBFF3B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E4DC")}
              />
              {email && !isEmailValid && (
                <p style={{ fontFamily: F.body, fontSize: "0.75rem", color: "#DC2626", marginTop: "0.3rem" }}>
                  Please enter a valid email.
                </p>
              )}
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
                placeholder="Minimum 8 characters"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#BBFF3B")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E5E4DC")}
              />
              {password && !isPasswordValid && (
                <p style={{ fontFamily: F.body, fontSize: "0.75rem", color: "#DC2626", marginTop: "0.3rem" }}>
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "7px", padding: "0.625rem 0.875rem", fontFamily: F.body, fontSize: "0.8125rem", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: "100%",
                backgroundColor: canSubmit ? "#BBFF3B" : "#E5E5DC",
                color: canSubmit ? "#0C0E13" : "#9C9C94",
                border: "none",
                borderRadius: "8px",
                padding: "0.8125rem",
                fontFamily: F.body,
                fontSize: "0.9375rem",
                fontWeight: 700,
                cursor: canSubmit ? "pointer" : "not-allowed",
                marginTop: "0.25rem",
                transition: "background-color 0.15s",
              }}
            >
              {loading ? "Creating account…" : "Sign Up"}
            </button>
          </form>

          <p style={{ fontFamily: F.body, fontSize: "0.8125rem", color: "#6B6B6B", textAlign: "center", marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#1C1C1A", fontWeight: 600, textDecoration: "underline", textDecorationColor: "#BBFF3B", textUnderlineOffset: "3px" }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6B6B6B", fontFamily: "sans-serif" }}>Loading…</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
