"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function ChatPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [otherUserId, setOtherUserId] = useState("");
  const [canSend, setCanSend] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Get application details
      const { data: app } = await supabase
        .from("applications")
        .select("candidate_id, jobs(employer_id)")
        .eq("id", applicationId)
        .single();

      if (!app) return;

      const appData = app as unknown as {
        candidate_id: string;
        jobs: { employer_id: string };
      };
      const employerId = appData.jobs.employer_id;
      const candidateId = appData.candidate_id;
      const otherUser = user.id === employerId ? candidateId : employerId;
      setOtherUserId(otherUser);

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });

      const loadedMsgs = (msgs as Message[]) ?? [];
      setMessages(loadedMsgs);

      // If employer or messages already exist, can send
      if (user.id === employerId || loadedMsgs.length > 0) {
        setCanSend(true);
      }

      // Mark unread messages as read
      const unread = loadedMsgs.filter(
        (m) => m.receiver_id === user.id && !m.is_read
      );
      for (const m of unread) {
        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("id", m.id);
      }
    }
    load();
  }, [applicationId, supabase]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`messages-${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `application_id=eq.${applicationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          setCanSend(true);

          if (newMsg.receiver_id === userId) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [applicationId, userId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [sendError, setSendError] = useState("");

  async function handleSend() {
    if (!newMessage.trim() || sending || !canSend) return;

    setSending(true);
    setSendError("");
    const msgContent = newMessage.trim();

    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      receiver_id: otherUserId,
      application_id: applicationId,
      content: msgContent,
    });

    if (error) {
      setSendError("Failed to send message. Please try again.");
      setSending(false);
      return;
    }

    setNewMessage("");
    setSending(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-warm-50">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender_id === userId
                  ? "rounded-br-sm bg-primary-600 text-white"
                  : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
              }`}
            >
              <p>{msg.content}</p>
              <p
                className={`mt-1 text-right text-xs ${
                  msg.sender_id === userId
                    ? "text-primary-200"
                    : "text-gray-400"
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        {sendError && (
          <div className="mx-auto mb-2 max-w-3xl rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {sendError}
          </div>
        )}
        {canSend ? (
          <div className="mx-auto flex max-w-3xl gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">
            Waiting for recruiter to start the conversation
          </p>
        )}
      </div>
    </div>
  );
}
