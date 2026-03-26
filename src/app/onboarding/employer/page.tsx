"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatUI, { ChatMessage, ChatOption } from "@/components/chat/ChatUI";
import { createClient } from "@/lib/supabase/client";
import { employerSections } from "@/lib/onboarding-questions";

export default function EmployerOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [selectMode, setSelectMode] = useState<"single" | "multi">("single");
  const [maxSelections, setMaxSelections] = useState<number | undefined>();

  const loadSection = useCallback(
    async (sectionIndex: number) => {
      if (sectionIndex >= employerSections.length) {
        // Questions done — mark in_progress (completed after company profile setup)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ onboarding_status: "in_progress" })
            .eq("id", user.id);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: "ai-done",
            role: "ai",
            content:
              "Awesome, you're all set! Let's set up your company profile next.",
          },
        ]);
        setTimeout(() => router.push("/onboarding/employer/company-profile"), 2000);
        return;
      }

      setIsTyping(true);
      setOptions([]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "employer",
            currentSection: sectionIndex,
            previousAnswers: answers,
          }),
        });

        const data = await res.json();

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: `ai-${sectionIndex}`, role: "ai", content: data.message },
          ]);
          setOptions(data.options);
          setSelectMode(data.selectMode);
          setMaxSelections(data.maxSelections);
          setIsTyping(false);
        }, 500);
      } catch {
        setIsTyping(false);
      }
    },
    [answers, router, supabase]
  );

  useEffect(() => {
    async function loadProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signup?role=employer");
        return;
      }

      const { data: profile } = await supabase
        .from("employer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const savedAnswers: Record<string, string | string[]> = {};
        let resumeSection = 0;

        for (const section of employerSections) {
          const val = profile[section.field as keyof typeof profile];
          if (val !== null && val !== undefined) {
            savedAnswers[section.field] = val as string | string[];
            resumeSection = section.id + 1;
          } else {
            break;
          }
        }

        if (Object.keys(savedAnswers).length > 0) {
          setAnswers(savedAnswers);
          setCurrentSection(resumeSection);
        }

        loadSection(resumeSection);
      } else {
        await supabase.from("employer_profiles").insert({
          user_id: user.id,
        });
        await supabase
          .from("profiles")
          .update({ onboarding_status: "in_progress" })
          .eq("id", user.id);
        loadSection(0);
      }
    }

    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelect(values: string[]) {
    const section = employerSections[currentSection];
    if (!section) return;

    const displayValue = values
      .map((v) => section.options.find((o) => o.value === v)?.label ?? v)
      .join(", ");

    setMessages((prev) => [
      ...prev,
      { id: `user-${currentSection}`, role: "user", content: displayValue },
    ]);
    setOptions([]);

    const newAnswers = {
      ...answers,
      [section.field]:
        section.selectMode === "multi" ? values : values[0],
    };
    setAnswers(newAnswers);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("employer_profiles")
        .update({
          [section.field]:
            section.selectMode === "multi" ? values : values[0],
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    const nextSection = currentSection + 1;
    setCurrentSection(nextSection);
    loadSection(nextSection);
  }

  return (
    <ChatUI
      messages={messages}
      isTyping={isTyping}
      onSelect={handleSelect}
      selectMode={selectMode}
      maxSelections={maxSelections}
      options={options}
    />
  );
}
