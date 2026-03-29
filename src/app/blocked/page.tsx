"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const F = {
  display: "var(--font-display), sans-serif",
  body: "var(--font-sans), sans-serif",
} as const;

export default function BlockedPage() {
  const router = useRouter();

  async function handleGoHome() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#faf7f2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "420px" }}>
        {/* Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#FEF0EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <svg
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#FF5C2C"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: F.display,
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#1C1917",
            letterSpacing: "-0.02em",
            marginBottom: "0.75rem",
          }}
        >
          Thanks for stopping by!
        </h1>

        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.95rem",
            lineHeight: 1.65,
            color: "#78716C",
            marginBottom: "2rem",
          }}
        >
          This platform keeps IIT, NIT, and other elite-college listings
          separate — so freshers from every other college get a fair shot.
          You&apos;re already a rockstar, and we know you&apos;ll find something
          great elsewhere!
        </p>

        <button
          onClick={handleGoHome}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            backgroundColor: "#FF5C2C",
            color: "#ffffff",
            fontFamily: F.body,
            fontWeight: 700,
            fontSize: "0.9rem",
            padding: "0.8rem 1.6rem",
            borderRadius: "7px",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Go Home
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </main>
  );
}
