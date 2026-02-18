"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [email, setEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      }
    });
  }, []);

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

      if (role === "employer") {
        router.push("/onboarding/employer");
      } else {
        router.push("/onboarding/candidate");
      }
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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Verify Your Email</h1>
        <p className="mb-8 text-sm text-gray-500">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email || "your email"}</span>
        </p>

        <div className="mb-6 flex justify-center gap-3" onPaste={handlePaste}>
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
              className="h-14 w-12 rounded-lg border-2 border-gray-300 text-center text-2xl font-bold text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={otp.some((d) => !d) || loading}
          className="mb-4 w-full rounded-lg bg-primary-600 py-3 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-sm text-gray-500 transition hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>
    </main>
  );
}
