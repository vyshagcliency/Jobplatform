"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const F = {
  display: "var(--font-display), sans-serif",
  body: "var(--font-sans), sans-serif",
} as const;

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

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
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            marginBottom: "2.5rem",
          }}
        >
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

        {/* Mail icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            backgroundColor: "#F5F3ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.75rem",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              stroke="#1C1C1A"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: F.display,
            fontSize: "1.625rem",
            fontWeight: 800,
            color: "#1C1C1A",
            letterSpacing: "-0.02em",
            marginBottom: "0.625rem",
          }}
        >
          Check your inbox
        </h1>

        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.9rem",
            color: "#6B6B6B",
            lineHeight: 1.65,
            marginBottom: "0.5rem",
          }}
        >
          We sent a confirmation link to
        </p>
        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.9375rem",
            fontWeight: 700,
            color: "#1C1C1A",
            marginBottom: "1.75rem",
          }}
        >
          {email}
        </p>

        {/* Instruction box */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#F5F3ED",
            borderRadius: "10px",
            padding: "1.125rem 1.25rem",
            textAlign: "left",
            marginBottom: "2rem",
          }}
        >
          <p
            style={{
              fontFamily: F.body,
              fontSize: "0.8125rem",
              color: "#4A4A45",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Click the link in the email to verify your account and get started.
            The link expires in <strong>60 minutes</strong>.
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            width: "100%",
            borderTop: "1px solid #E8E5DC",
            marginBottom: "1.5rem",
          }}
        />

        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.8125rem",
            color: "#6B6B6B",
          }}
        >
          Wrong email?{" "}
          <Link
            href="/signup"
            style={{
              color: "#1C1C1A",
              fontWeight: 600,
              textDecoration: "underline",
              textDecorationColor: "#BBFF3B",
              textUnderlineOffset: "3px",
            }}
          >
            Go back and try again
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#6B6B6B", fontFamily: "sans-serif" }}>Loading…</p>
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
