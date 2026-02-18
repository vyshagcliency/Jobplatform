"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BrandLogo() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="30" height="30" rx="7" fill="#BBFF3B" />
      <path
        d="M15 21 L15 9"
        stroke="#0C0E13"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M10.5 14 L15 9 L19.5 14"
        stroke="#0C0E13"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 19.5 L18.5 19.5"
        stroke="#0C0E13"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isLight = true; // app-wide light theme

  const [role, setRole] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoaded(true);
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) setRole(profile.role);

      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count ?? 0);
      setLoaded(true);
    }
    load();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const candidateLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/dashboard/candidate", label: "Applications" },
  ];

  const employerLinks = [
    { href: "/dashboard/employer", label: "Dashboard" },
    { href: "/dashboard/employer/post-job", label: "Post Job" },
  ];

  const links = role === "employer" ? employerLinks : candidateLinks;
  const isGuest = loaded && !role;
  const isLoggedIn = loaded && !!role;

  const linkStyle: React.CSSProperties = {
    fontFamily: "var(--font-sans), sans-serif",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: isLight ? "#78716C" : "#9CA3AF",
    textDecoration: "none",
  };

  return (
    <nav
      className="sticky top-0 z-50"
      style={
        isLight
          ? {
              backgroundColor: "rgba(250, 247, 242, 0.95)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderBottom: "1px solid rgba(0,0,0,0.08)",
            }
          : {
              backgroundColor: "rgba(12, 14, 19, 0.9)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }
      }
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.5rem",
        }}
      >
        {/* Brand — left-anchored */}
        <Link
          href={
            role === "employer"
              ? "/dashboard/employer"
              : role === "candidate"
              ? "/jobs"
              : "/"
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <BrandLogo />
          <span
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: isLight ? "#1C1917" : "#EDEAE4",
              letterSpacing: "-0.01em",
            }}
          >
            Culture Hires
          </span>
        </Link>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          {/* Guest state */}
          {isGuest && (
            <>
              <Link href="/login" style={linkStyle}>
                Log in
              </Link>
              <Link
                href="/signup"
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  backgroundColor: "#BBFF3B",
                  color: "#0C0E13",
                  padding: "0.5rem 1.125rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                }}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Logged-in: desktop links */}
          {isLoggedIn && (
            <>
              <div className="hidden md:flex items-center gap-6">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} style={linkStyle}>
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/chat"
                  style={{ ...linkStyle, position: "relative" }}
                >
                  Chat
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-12px",
                        backgroundColor: "#FF5C2C",
                        color: "white",
                        borderRadius: "50%",
                        width: "16px",
                        height: "16px",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    ...linkStyle,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isLight ? "#A8A29E" : "#6B7280",
                  }}
                >
                  Logout
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden"
                aria-label="Toggle menu"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <svg
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#9CA3AF"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && isLoggedIn && (
        <div
          className="md:hidden"
          style={{
            borderTop: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.07)",
            backgroundColor: isLight ? "#faf7f2" : "#0C0E13",
            padding: "0.25rem 1.5rem 1rem",
          }}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "block",
                padding: "0.75rem 0",
                ...linkStyle,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 0",
              ...linkStyle,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            Chat
            {unreadCount > 0 && (
              <span
                style={{
                  backgroundColor: "#FF5C2C",
                  color: "white",
                  borderRadius: "50%",
                  width: "18px",
                  height: "18px",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.75rem 0",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#FF5C2C",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
