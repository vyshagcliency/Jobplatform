"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const F = {
  display: "var(--font-display), sans-serif",
  body: "var(--font-sans), sans-serif",
} as const;

type Role = "candidate" | "employer";

export default function RoleSelectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<Role | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  // If the user is already past onboarding, don't make them pick a role again.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      supabase
        .from("profiles")
        .select("role, onboarding_status, eligibility")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          if (!profile) {
            setChecking(false);
            return;
          }
          if (profile.eligibility === "ineligible") {
            router.replace("/blocked");
            return;
          }
          if (profile.onboarding_status === "completed") {
            router.replace(
              profile.role === "employer" ? "/dashboard/employer" : "/jobs"
            );
            return;
          }
          setChecking(false);
        });
    });
  }, [router]);

  async function chooseRole(role: Role) {
    setLoading(role);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", user.id);
    if (updateError) {
      setError(updateError.message);
      setLoading(null);
      return;
    }
    router.replace(role === "employer" ? "/onboarding/employer" : "/onboarding/candidate");
  }

  if (checking) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#faf7f2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ fontFamily: F.body, color: "#78716C" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#faf7f2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontFamily: F.display,
              fontSize: "2rem",
              fontWeight: 800,
              color: "#1C1917",
              letterSpacing: "-0.02em",
              marginBottom: "0.625rem",
              lineHeight: 1.15,
            }}
          >
            One quick question
          </h1>
          <p
            style={{
              fontFamily: F.body,
              fontSize: "1rem",
              color: "#78716C",
              lineHeight: 1.5,
            }}
          >
            How will you be using Culture Hires?
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1fr",
          }}
        >
          <RoleCard
            label="I'm a Student / Fresher"
            description="Looking for paid roles, internships, or full-time work."
            accent="#BBFF3B"
            onClick={() => chooseRole("candidate")}
            loading={loading === "candidate"}
            disabled={loading !== null}
          />
          <RoleCard
            label="I'm an Employer / Recruiter"
            description="Hiring freshers from Tier-2 and Tier-3 colleges."
            accent="#FF5C2C"
            onClick={() => chooseRole("employer")}
            loading={loading === "employer"}
            disabled={loading !== null}
          />
        </div>

        {error && (
          <div
            style={{
              marginTop: "1.25rem",
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontFamily: F.body,
              fontSize: "0.875rem",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        <p
          style={{
            fontFamily: F.body,
            fontSize: "0.8125rem",
            color: "#9C9C94",
            textAlign: "center",
            marginTop: "1.75rem",
          }}
        >
          You can&apos;t change this later, so pick the one that fits.
        </p>
      </div>
    </main>
  );
}

function RoleCard({
  label,
  description,
  accent,
  onClick,
  loading,
  disabled,
}: {
  label: string;
  description: string;
  accent: string;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        textAlign: "left",
        backgroundColor: "#ffffff",
        border: "1.5px solid #E8E5DC",
        borderRadius: "14px",
        padding: "1.25rem 1.375rem",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: F.body,
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        opacity: disabled && !loading ? 0.55 : 1,
        transition: "border-color 0.15s, transform 0.1s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.boxShadow = `0 4px 18px -8px ${accent}80`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E8E5DC";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          backgroundColor: accent,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12l5 5L20 7"
            stroke="#0C0E13"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontFamily: F.display,
            fontSize: "1.0625rem",
            fontWeight: 700,
            color: "#1C1917",
            marginBottom: "0.2rem",
          }}
        >
          {loading ? "Setting up…" : label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "0.875rem",
            color: "#78716C",
            lineHeight: 1.45,
          }}
        >
          {description}
        </span>
      </span>
    </button>
  );
}
