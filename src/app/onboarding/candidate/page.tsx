"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ChatUI, { ChatMessage, ChatOption } from "@/components/chat/ChatUI";
import { createClient } from "@/lib/supabase/client";
import { candidateSections } from "@/lib/onboarding-questions";

type OnboardingState = "chat" | "college" | "resume" | "done" | "blocked";

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [selectMode, setSelectMode] = useState<"single" | "multi">("single");
  const [maxSelections, setMaxSelections] = useState<number | undefined>();
  const [state, setState] = useState<OnboardingState>("chat");

  // College search state
  const [collegeQuery, setCollegeQuery] = useState("");
  const [collegeResults, setCollegeResults] = useState<
    { id: string; name: string; tier: number }[]
  >([]);
  const [searchingColleges, setSearchingColleges] = useState(false);

  // Resume state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [projects, setProjects] = useState<{ title: string; description: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadSection = useCallback(
    async (sectionIndex: number) => {
      if (sectionIndex >= candidateSections.length) {
        // Move to college gate (section 7)
        setState("college");
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-college`,
            role: "ai",
            content: "Almost there! Which college are you from? Type to search...",
          },
        ]);
        return;
      }

      setIsTyping(true);
      setOptions([]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "candidate",
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
    [answers]
  );

  useEffect(() => {
    // Load saved progress
    async function loadProgress() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signup?role=candidate");
        return;
      }

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        const savedAnswers: Record<string, string | string[]> = {};
        let resumeSection = 0;

        for (const section of candidateSections) {
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

          if (profile.college_id) {
            if (profile.resume_url) {
              setState("done");
              router.push("/jobs");
              return;
            }
            setState("resume");
            return;
          }

          if (resumeSection >= candidateSections.length) {
            setState("college");
            setMessages([
              {
                id: "ai-college",
                role: "ai",
                content: "Almost there! Which college are you from? Type to search...",
              },
            ]);
            return;
          }
        }

        loadSection(resumeSection);
      } else {
        // Create candidate profile
        await supabase.from("candidate_profiles").insert({
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
    const section = candidateSections[currentSection];
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

    // Persist to DB
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("candidate_profiles")
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

  // College search
  useEffect(() => {
    if (state !== "college" || collegeQuery.length < 2) {
      setCollegeResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingColleges(true);
      const { data } = await supabase
        .from("colleges")
        .select("id, name, tier")
        .ilike("name", `%${collegeQuery}%`)
        .limit(10);
      setCollegeResults(data ?? []);
      setSearchingColleges(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [collegeQuery, state, supabase]);

  async function handleCollegeSelect(college: {
    id: string;
    name: string;
    tier: number;
  }) {
    setMessages((prev) => [
      ...prev,
      { id: "user-college", role: "user", content: college.name },
    ]);
    setCollegeResults([]);
    setCollegeQuery("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (college.tier === 1) {
      setState("blocked");
      await supabase
        .from("profiles")
        .update({ eligibility: "ineligible" })
        .eq("id", user.id);

      setMessages((prev) => [
        ...prev,
        {
          id: "ai-blocked",
          role: "ai",
          content:
            "Hey — this platform is only for Tier-2/Tier-3 freshers, so we can keep opportunities fair. You're already a rockstar, and we know you'll find something great elsewhere! 🌟",
        },
      ]);
      return;
    }

    await supabase
      .from("candidate_profiles")
      .update({ college_id: college.id, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    setState("resume");
    setMessages((prev) => [
      ...prev,
      {
        id: "ai-resume",
        role: "ai",
        content:
          "Nice! Now upload your resume (PDF, max 5MB) and optionally add your portfolio links.",
      },
    ]);
  }

  async function handleResumeSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !resumeFile) return;

    setUploading(true);

    const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile);

    if (uploadError) {
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(filePath);

    await supabase
      .from("candidate_profiles")
      .update({
        resume_url: publicUrl,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        projects: projects.length > 0 ? projects : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    await supabase
      .from("profiles")
      .update({ onboarding_status: "completed" })
      .eq("id", user.id);

    setUploading(false);
    setState("done");
    setMessages((prev) => [
      ...prev,
      {
        id: "ai-done",
        role: "ai",
        content: "You're all set! Let's find your match 🎉",
      },
    ]);
  }

  if (state === "blocked") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-warm-50 px-4 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Thanks for stopping by!
        </h1>
        <p className="max-w-md text-lg text-gray-600">
          This platform is only for Tier-2 &amp; Tier-3 freshers, so we can keep
          opportunities fair. You&apos;re already a rockstar, and we know
          you&apos;ll find something great elsewhere!
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-primary-50 via-warm-50 to-accent-50">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-40 pt-6">
        {state === "chat" && (
          <ChatUI
            messages={messages}
            isTyping={isTyping}
            onSelect={handleSelect}
            selectMode={selectMode}
            maxSelections={maxSelections}
            options={options}
          />
        )}

        {state !== "chat" && (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary-600 text-white"
                      : "rounded-bl-sm bg-white text-gray-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </>
        )}

        {/* College Search */}
        {state === "college" && (
          <div className="mx-auto max-w-sm space-y-2">
            <input
              type="text"
              value={collegeQuery}
              onChange={(e) => setCollegeQuery(e.target.value)}
              placeholder="Type your college name..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {searchingColleges && (
              <p className="text-sm text-gray-400">Searching...</p>
            )}
            {collegeResults.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCollegeSelect(c)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-primary-50"
              >
                <span className="text-gray-800">{c.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.tier === 1
                      ? "bg-red-100 text-red-600"
                      : c.tier === 2
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  Tier {c.tier}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Resume Upload */}
        {state === "resume" && (
          <div className="mx-auto max-w-sm space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Resume (PDF, max 5MB) *
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 5 * 1024 * 1024) {
                    setResumeFile(file);
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="GitHub URL (optional)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn URL (optional)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="Portfolio URL (optional)"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />

            {/* Projects */}
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">
                Projects (optional, up to 3)
              </p>
              {projects.map((p, i) => (
                <div key={i} className="mb-2 space-y-1">
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const np = [...projects];
                      np[i] = { ...np[i], title: e.target.value };
                      setProjects(np);
                    }}
                    placeholder="Project title"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500"
                  />
                  <input
                    type="text"
                    value={p.description}
                    onChange={(e) => {
                      const np = [...projects];
                      np[i] = { ...np[i], description: e.target.value };
                      setProjects(np);
                    }}
                    placeholder="Short description"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary-500"
                  />
                </div>
              ))}
              {projects.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setProjects([...projects, { title: "", description: "" }])
                  }
                  className="text-sm font-medium text-primary-600 hover:underline"
                >
                  + Add project
                </button>
              )}
            </div>

            <button
              onClick={handleResumeSubmit}
              disabled={!resumeFile || uploading}
              className="w-full rounded-xl bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Complete Profile"}
            </button>
          </div>
        )}

        {/* Done */}
        {state === "done" && (
          <div className="mx-auto max-w-sm text-center">
            <button
              onClick={() => router.push("/jobs")}
              className="rounded-xl bg-primary-600 px-8 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Go to Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
