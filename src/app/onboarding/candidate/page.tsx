"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage, ChatOption, AiMessage, PillOptions, TypingIndicator } from "@/components/chat/ChatUI";
import { createClient } from "@/lib/supabase/client";
import { candidateSections } from "@/lib/onboarding-questions";

type OnboardingState = "chat" | "college" | "resume" | "done" | "blocked";

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

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
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadSection = useCallback(
    async (sectionIndex: number) => {
      if (sectionIndex >= candidateSections.length) {
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
              await supabase
                .from("profiles")
                .update({ onboarding_status: "completed" })
                .eq("id", user.id);
              setState("done");
              router.push("/jobs");
              return;
            }
            setState("resume");
            setMessages([
              {
                id: "ai-resume",
                role: "ai",
                content:
                  "Upload your resume (PDF, max 5MB) and optionally add your portfolio links.",
              },
            ]);
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
            "Hey — this platform keeps IIT, NIT, and other elite-college listings separate so every other fresher gets a fair shot. You're already a rockstar, and we know you'll find something great elsewhere!",
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
          "Nice! Now upload your resume and optionally add your portfolio links.",
      },
    ]);
  }

  async function handleResumeSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !resumeFile) return;

    setUploading(true);
    setError(null);

    const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile);

    if (uploadError) {
      setUploading(false);
      setError(
        uploadError.message.includes("Bucket not found") ||
          uploadError.message.includes("not found")
          ? "Resume storage is not configured. Please contact support."
          : uploadError.message.includes("security") ||
            uploadError.message.includes("policy")
          ? "Upload permission denied. Please contact support."
          : `Upload failed: ${uploadError.message}`
      );
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("resumes").getPublicUrl(filePath);

    const { error: profileError } = await supabase
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

    if (profileError) {
      setUploading(false);
      setError(`Failed to save profile: ${profileError.message}`);
      return;
    }

    const { error: statusError } = await supabase
      .from("profiles")
      .update({ onboarding_status: "completed" })
      .eq("id", user.id);

    if (statusError) {
      setUploading(false);
      setError(`Failed to complete profile: ${statusError.message}`);
      return;
    }

    setUploading(false);
    setState("done");
    setTimeout(() => router.push("/jobs"), 1500);
  }

  // --- Blocked screen ---
  if (state === "blocked") {
    async function handleBlockedGoHome() {
      await supabase.auth.signOut();
      router.push("/");
    }

    return (
      <div
        style={{
          height: "calc(100vh - 56px)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#faf7f2",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "400px" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "#FEF0EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#FF5C2C" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display), sans-serif",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#1C1917",
                marginBottom: "0.75rem",
              }}
            >
              Thanks for stopping by!
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "0.925rem",
                lineHeight: 1.6,
                color: "#78716C",
                marginBottom: "1.75rem",
              }}
            >
              This platform keeps IIT, NIT, and other elite-college listings
              separate — so every other fresher gets a fair shot. You&apos;re
              already a rockstar — we know you&apos;ll find something great
              elsewhere!
            </p>
            <button
              onClick={handleBlockedGoHome}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "#FF5C2C",
                color: "#ffffff",
                fontFamily: "var(--font-sans), sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "0.8rem 1.6rem",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Go Home
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Done screen ---
  if (state === "done") {
    return (
      <div className="flex flex-col bg-[#faf7f2]" style={{ height: "calc(100vh - 56px)" }}>
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <div className="mx-auto max-w-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="mb-3 font-[family-name:var(--font-fraunces)] text-2xl font-bold text-gray-900">
              You&apos;re all set!
            </h1>
            <p className="mb-6 text-[0.925rem] text-gray-500">
              Your profile is complete. Let&apos;s find your perfect match.
            </p>
            <button
              onClick={() => router.push("/jobs")}
              className="w-full rounded-xl bg-[#BBFF3B] py-3.5 font-semibold text-gray-900 transition hover:bg-[#a8e635]"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Resume form screen ---
  if (state === "resume") {
    return (
      <div className="flex flex-col bg-[#faf7f2]" style={{ height: "calc(100vh - 56px)" }}>
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <div className="mx-auto max-w-md">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#BBFF3B]/30">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#4d7c0f" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-bold text-gray-900">
                Almost done!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload your resume and optionally add portfolio links.
              </p>
            </div>

            {/* Resume upload */}
            <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
              <div>
                <label className="mb-1.5 block text-[0.8125rem] font-semibold text-gray-700">
                  Resume (PDF, max 5MB) <span className="text-red-500">*</span>
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition hover:border-[#BBFF3B] hover:bg-[#BBFF3B]/5">
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setError("File is too large. Maximum size is 5MB.");
                          return;
                        }
                        setError(null);
                        setResumeFile(file);
                      }
                    }}
                  />
                  {resumeFile ? (
                    <span className="text-sm font-medium text-gray-800">{resumeFile.name}</span>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      <span className="text-sm text-gray-500">Click to upload PDF</span>
                    </>
                  )}
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-[0.8125rem] font-semibold text-gray-700">Links (optional)</p>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="GitHub URL"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BBFF3B] focus:ring-2 focus:ring-[#BBFF3B]/20"
                />
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="LinkedIn URL"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BBFF3B] focus:ring-2 focus:ring-[#BBFF3B]/20"
                />
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="Portfolio URL"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#BBFF3B] focus:ring-2 focus:ring-[#BBFF3B]/20"
                />
              </div>

              {/* Projects */}
              <div>
                <p className="mb-2 text-[0.8125rem] font-semibold text-gray-700">
                  Projects (optional, up to 3)
                </p>
                {projects.map((p, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={p.title}
                      onChange={(e) => {
                        const np = [...projects];
                        np[i] = { ...np[i], title: e.target.value };
                        setProjects(np);
                      }}
                      placeholder="Title"
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#BBFF3B]"
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
                      className="flex-[2] rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#BBFF3B]"
                    />
                  </div>
                ))}
                {projects.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setProjects([...projects, { title: "", description: "" }])
                    }
                    className="text-sm font-medium text-[#4d7c0f] hover:underline"
                  >
                    + Add project
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleResumeSubmit}
              disabled={!resumeFile || uploading}
              className="mt-5 w-full rounded-xl bg-[#BBFF3B] py-3.5 font-semibold text-gray-900 transition hover:bg-[#a8e635] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? "Uploading..." : "Complete Profile"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Chat & College states ---
  const hasOptions = options && options.length > 0 && !isTyping;
  const showBottomPanel = (state === "chat" && hasOptions) || state === "college";

  return (
    <div className="flex flex-col bg-[#faf7f2]" style={{ height: "calc(100vh - 56px)" }}>
      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4">
        <div className="mx-auto max-w-xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" ? (
                <AiMessage content={msg.content} />
              ) : (
                <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-3 text-white shadow-sm">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed bottom panel */}
      {showBottomPanel && (
        <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="mx-auto max-w-xl">
            {/* Chat options */}
            {state === "chat" && hasOptions && (
              <PillOptions
                options={options}
                selectMode={selectMode}
                maxSelections={maxSelections}
                onSelect={handleSelect}
              />
            )}

            {/* College search */}
            {state === "college" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={collegeQuery}
                  onChange={(e) => setCollegeQuery(e.target.value)}
                  placeholder="Type your college name..."
                  autoFocus
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-[#BBFF3B] focus:ring-2 focus:ring-[#BBFF3B]/20"
                />
                {searchingColleges && (
                  <p className="px-1 text-xs text-gray-400">Searching...</p>
                )}
                {collegeResults.length > 0 && (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {collegeResults.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleCollegeSelect(c)}
                        className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-left text-sm transition hover:bg-[#BBFF3B]/10"
                      >
                        <span className="text-gray-800">{c.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${
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
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
