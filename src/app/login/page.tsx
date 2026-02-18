"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_status, eligibility")
        .eq("id", user.id)
        .single();

      if (profile?.eligibility === "ineligible") {
        router.push("/blocked");
      } else if (
        profile?.onboarding_status === "pending" ||
        profile?.onboarding_status === "in_progress"
      ) {
        router.push(
          profile.role === "employer"
            ? "/onboarding/employer"
            : "/onboarding/candidate"
        );
      } else {
        router.push(profile?.role === "employer" ? "/dashboard/employer" : "/jobs");
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" className="mb-6 block text-sm text-primary-600 hover:underline">
          &larr; Back
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mb-8 text-sm text-gray-500">Log in to your account.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-600 py-3 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup?role=candidate" className="font-medium text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
