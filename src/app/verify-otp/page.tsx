"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const F = {
  display: "var(--font-syne), sans-serif",
  body: "var(--font-dm-sans), sans-serif",
} as const;

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // 1. Prefer email passed explicitly from signup as URL param
    const paramEmail = searchParams.get("email");
    if (paramEmail) {
      setEmail(paramEmail);
      return;
    }
    // 2. Fallback: read from an existing session (e.g. user came here directly)
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  const handleSubmit = useCallback(async () => {
    const code = otp.join("");
    if (code.length !== 6) return;

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email",
      });

      if (verifyError) {
        setError(verifyError.message);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role;

      router.push(role === "employer" ? "/onboarding/employer" : "/onboarding/candidate");
    } catch {
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  }, [otp, email, router]);

  useEffect(() => {
    if (otp.every((d) => d !== "")) {
      handleSubmit();
    }
  }, [otp, handleSubmit]);

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setCooldown(60);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2.5rem" }}>
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

        {/* Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "#F5F3ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.5rem",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#1C1C1A" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontFamily: F.display, fontSize: "1.625rem", fontWeight: 800, color: "#1C1C1A", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Check your email
        </h1>
        <p style={{ fontFamily: F.body, fontSize: "0.875rem", color: "#6B6B6B", marginBottom: "2rem", lineHeight: 1.6 }}>
          We sent a 6-digit code to{" "}
          <span style={{ fontWeight: 600, color: "#1C1C1A" }}>
            {email || "your email"}
          </span>
        </p>

        {/* OTP inputs */}
        <div
          style={{ display: "flex", gap: "0.625rem", marginBottom: "1.5rem", justifyContent: "center" }}
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "48px",
                height: "56px",
                textAlign: "center",
                fontSize: "1.375rem",
                fontWeight: 700,
                fontFamily: F.display,
                color: "#1C1C1A",
                border: `2px solid ${digit ? "#BBFF3B" : "#E5E4DC"}`,
                borderRadius: "10px",
                outline: "none",
                backgroundColor: digit ? "rgba(187,255,59,0.06)" : "#FAFAF8",
                transition: "border-color 0.15s, background-color 0.15s",
              }}
              onFocus={(e) => {
                if (!e.currentTarget.value) e.currentTarget.style.borderColor = "#BBFF3B";
              }}
              onBlur={(e) => {
                if (!e.currentTarget.value) e.currentTarget.style.borderColor = "#E5E4DC";
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ width: "100%", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "0.625rem 0.875rem", fontFamily: F.body, fontSize: "0.8125rem", color: "#DC2626", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={otp.some((d) => !d) || loading}
          style={{
            width: "100%",
            backgroundColor: otp.every((d) => d) && !loading ? "#BBFF3B" : "#E5E5DC",
            color: otp.every((d) => d) && !loading ? "#0C0E13" : "#9C9C94",
            border: "none",
            borderRadius: "8px",
            padding: "0.8125rem",
            fontFamily: F.body,
            fontSize: "0.9375rem",
            fontWeight: 700,
            cursor: otp.some((d) => !d) || loading ? "not-allowed" : "pointer",
            marginBottom: "1.25rem",
            transition: "background-color 0.15s",
          }}
        >
          {loading ? "Verifying…" : "Verify Code"}
        </button>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          style={{
            fontFamily: F.body,
            fontSize: "0.8125rem",
            color: cooldown > 0 ? "#9C9C94" : "#1C1C1A",
            background: "none",
            border: "none",
            cursor: cooldown > 0 ? "not-allowed" : "pointer",
            textDecoration: cooldown > 0 ? "none" : "underline",
            textDecorationColor: "#BBFF3B",
            textUnderlineOffset: "3px",
          }}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#6B6B6B", fontFamily: "sans-serif" }}>Loading…</p>
        </div>
      }
    >
      <VerifyOtpForm />
    </Suspense>
  );
}
