"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          role,
          full_name: fullName,
          onboarding_status: "pending",
        });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }

      router.push("/verify-otp");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" className="mb-6 block text-sm text-primary-600 hover:underline">
          &larr; Back
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {role === "candidate" ? "Join as a Student" : "Hire Freshers"}
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Create your account to get started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="you@example.com"
            />
            {email && !isEmailValid && (
              <p className="mt-1 text-sm text-red-500">Please enter a valid email.</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="Minimum 8 characters"
            />
            {password && !isPasswordValid && (
              <p className="mt-1 text-sm text-red-500">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-primary-600 py-3 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <SignupForm />
    </Suspense>
  );
}
