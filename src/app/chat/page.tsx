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

export default function ChatListPage() {
  const supabase = createClient();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all messages involving this user
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, application_id, content, is_read, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!msgs) {
        setLoading(false);
        return;
      }

      // Group by application_id
      const grouped = new Map<string, typeof msgs>();
      for (const msg of msgs) {
        const existing = grouped.get(msg.application_id) ?? [];
        existing.push(msg);
        grouped.set(msg.application_id, existing);
      }

      const convos: Conversation[] = [];
      for (const [appId, appMsgs] of grouped) {
        const lastMsg = appMsgs[0];
        const otherId =
          lastMsg.sender_id === user.id
            ? lastMsg.receiver_id
            : lastMsg.sender_id;

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", otherId)
          .single();

        const unread = appMsgs.filter(
          (m) => m.receiver_id === user.id && !m.is_read
        ).length;

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
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Messages</h1>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && conversations.length === 0 && (
          <p className="text-center text-gray-500">No conversations yet.</p>
        )}

        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.applicationId}
              href={`/chat/${c.applicationId}`}
              className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{c.otherName}</p>
                <p className="truncate text-sm text-gray-500">
                  {c.lastMessage}
                </p>
              </div>
              <div className="ml-4 text-right">
                <p className="text-xs text-gray-400">
                  {new Date(c.lastAt).toLocaleDateString("en-IN")}
                </p>
                {c.unreadCount > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
