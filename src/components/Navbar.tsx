"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();

  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile) setRole(profile.role);

      // Get unread message count
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false);

      setUnreadCount(count ?? 0);
    }
    load();
  }, [supabase]);

  // Realtime unread count
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

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href={
            role === "employer"
              ? "/dashboard/employer"
              : role === "candidate"
              ? "/jobs"
              : "/"
          }
          className="text-xl font-bold text-primary-600"
        >
          Underdog Jobs
        </Link>

        {/* Desktop nav */}
        {role && (
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/chat"
              className="relative text-sm font-medium text-gray-600 transition hover:text-primary-600"
            >
              Chat
              {unreadCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 transition hover:text-red-500"
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {role && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && role && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-sm font-medium text-gray-600"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/chat"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 py-3 text-sm font-medium text-gray-600"
          >
            Chat
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="block py-3 text-sm font-medium text-red-500"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
