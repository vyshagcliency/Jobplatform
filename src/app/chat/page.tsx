"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  applicationId: string;
  otherName: string;
  lastMessage: string;
  unreadCount: number;
  lastAt: string;
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
      backgroundColor: "#FEF0EB", border: "1.5px solid rgba(255,92,44,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 700,
      color: "#FF5C2C",
    }}>
      {initials}
    </div>
  );
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-IN", { weekday: "short" });
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatListPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, application_id, content, is_read, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) { setLoading(false); return; }

      const grouped = new Map<string, typeof msgs>();
      for (const msg of msgs) {
        const existing = grouped.get(msg.application_id) ?? [];
        existing.push(msg);
        grouped.set(msg.application_id, existing);
      }

      const convos: Conversation[] = [];
      for (const [appId, appMsgs] of grouped) {
        const lastMsg = appMsgs[0];
        const otherId = lastMsg.sender_id === user.id ? lastMsg.receiver_id : lastMsg.sender_id;

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", otherId)
          .single();

        const unread = appMsgs.filter((m) => m.receiver_id === user.id && !m.is_read).length;

        convos.push({
          applicationId: appId,
          otherName: otherProfile?.full_name ?? "Unknown",
          lastMessage: lastMsg.content,
          unreadCount: unread,
          lastAt: lastMsg.created_at,
        });
      }

      setConversations(convos);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf7f2", padding: "1.75rem 1.25rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 800, color: "#1C1917", letterSpacing: "-0.025em",
            lineHeight: 1.1, marginBottom: "0.3rem",
          }}>
            Messages
          </h1>
          {!loading && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "#78716C" }}>
              {conversations.length === 0
                ? "Your conversations will appear here"
                : `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "12px",
                border: "1px solid rgba(0,0,0,0.06)", height: 68,
                opacity: 0.5 + i * 0.1,
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && conversations.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "4rem 1.5rem", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "18px",
              backgroundColor: "#FEF0EB", border: "1.5px solid rgba(255,92,44,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="#FF5C2C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700,
              color: "#1C1917", marginBottom: "0.4rem", letterSpacing: "-0.01em",
            }}>
              No conversations yet
            </h2>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.875rem",
              color: "#78716C", lineHeight: 1.6, maxWidth: 280,
            }}>
              When employers reach out about your application, messages will show up here.
            </p>
          </div>
        )}

        {/* Conversation list */}
        {!loading && conversations.length > 0 && (
          <div style={{
            backgroundColor: "#ffffff", borderRadius: "14px",
            border: "1px solid rgba(0,0,0,0.07)",
            overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {conversations.map((c, idx) => {
              const isLast = idx === conversations.length - 1;
              return (
                <Link
                  key={c.applicationId}
                  href={`/chat/${c.applicationId}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.875rem",
                    padding: "1rem 1.25rem", textDecoration: "none",
                    borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                    transition: "background 0.1s",
                  }}
                  className="chat-row"
                >
                  <InitialAvatar name={c.otherName} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.2rem" }}>
                      <p style={{
                        fontFamily: "var(--font-sans)", fontWeight: c.unreadCount > 0 ? 700 : 600,
                        fontSize: "0.9rem", color: "#1C1917",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {c.otherName}
                      </p>
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                        color: "#A8A29E", whiteSpace: "nowrap", marginLeft: "0.5rem", flexShrink: 0,
                      }}>
                        {formatTime(c.lastAt)}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.82rem",
                        color: c.unreadCount > 0 ? "#44403C" : "#A8A29E",
                        fontWeight: c.unreadCount > 0 ? 500 : 400,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        flex: 1,
                      }}>
                        {c.lastMessage}
                      </p>
                      {c.unreadCount > 0 && (
                        <span style={{
                          marginLeft: "0.5rem", flexShrink: 0,
                          minWidth: 20, height: 20, borderRadius: "10px",
                          backgroundColor: "#FF5C2C", color: "#fff",
                          fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 700,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "0 5px",
                        }}>
                          {c.unreadCount > 9 ? "9+" : c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .chat-row:hover { background-color: #faf7f2 !important; }
      `}</style>
    </div>
  );
}
