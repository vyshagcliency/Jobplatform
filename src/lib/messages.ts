"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendMessage(
  senderId: string,
  receiverId: string,
  applicationId: string,
  content: string
) {
  const supabase = await createClient();

  // Check if employer sent first message (only employer can start)
  const { data: existing } = await supabase
    .from("messages")
    .select("id, sender_id")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (!existing || existing.length === 0) {
    // First message — check sender is the employer
    const { data: app } = await supabase
      .from("applications")
      .select("job_id, jobs(employer_id)")
      .eq("id", applicationId)
      .single();

    const employerId = (app as unknown as { jobs: { employer_id: string } })
      ?.jobs?.employer_id;
    if (senderId !== employerId) {
      return { error: "Only the employer can send the first message." };
    }
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: senderId,
    receiver_id: receiverId,
    application_id: applicationId,
    content,
  });

  return { error: error?.message ?? null };
}

export async function getMessages(applicationId: string, cursor?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("messages")
    .select("id, sender_id, receiver_id, content, is_read, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;
  return { data: data?.reverse() ?? [], error: error?.message ?? null };
}

export async function markAsRead(messageId: string) {
  const supabase = await createClient();
  await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
}
