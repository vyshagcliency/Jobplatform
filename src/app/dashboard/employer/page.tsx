"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Applicant {
  id: string;
  status: string;
  created_at: string;
  candidate_id: string;
  profiles: { full_name: string };
  candidate_profiles: { strengths: string[] | null; resume_url: string | null } | null;
  colleges: { name: string } | null;
}

interface JobGroup {
  jobId: string;
  jobTitle: string;
  applicants: Applicant[];
}

const statusOptions = ["applied", "shortlisted", "interview", "offer", "hired"];

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  applied:     { bg: "#F3F4F6", text: "#4B5563", dot: "#9CA3AF" },
  shortlisted: { bg: "#EFF6FF", text: "#2563EB", dot: "#3B82F6" },
  interview:   { bg: "#F5F3FF", text: "#7C3AED", dot: "#8B5CF6" },
  offer:       { bg: "#FFFBEB", text: "#D97706", dot: "#F59E0B" },
  hired:       { bg: "#F0FDF4", text: "#16A34A", dot: "#22C55E" },
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 24 24" fill="none"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M6 9l6 6 6-6" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InitialAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      backgroundColor: "#FEF0EB",
      border: "1.5px solid rgba(255,92,44,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", fontSize: "0.75rem", fontWeight: 600,
      color: "#FF5C2C", flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "5rem 1.5rem", textAlign: "center",
    }}>
      {/* Icon */}
      <div style={{
        width: 72, height: 72, borderRadius: "20px",
        backgroundColor: "#FEF0EB",
        border: "1.5px solid rgba(255,92,44,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1.5rem",
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="15" rx="2" stroke="#FF5C2C" strokeWidth="1.5" />
          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FF5C2C" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 12v4M10 14h4" stroke="#FF5C2C" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <h2 style={{
        fontFamily: "var(--font-display)", fontSize: "1.375rem", fontWeight: 700,
        color: "#1C1917", marginBottom: "0.5rem", letterSpacing: "-0.01em",
      }}>
        No jobs posted yet
      </h2>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.9rem",
        color: "#78716C", lineHeight: 1.6, maxWidth: 320, marginBottom: "2rem",
      }}>
        Post your first role and start receiving applications from talented freshers.
      </p>
      <Link
        href="/dashboard/employer/post-job"
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          backgroundColor: "#FF5C2C", color: "#fff",
          fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.9rem",
          padding: "0.75rem 1.5rem", borderRadius: "10px", textDecoration: "none",
        }}
      >
        Post your first job
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default function EmployerDashboard() {
  const supabase = createClient();
  const [groups, setGroups] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (!jobs) { setLoading(false); return; }

      const jobGroups: JobGroup[] = [];
      for (const job of jobs) {
        const { data: apps } = await supabase
          .from("applications")
          .select(`
            id, status, created_at, candidate_id,
            profiles:candidate_id(full_name),
            candidate_profiles:candidate_id(strengths, resume_url)
          `)
          .eq("job_id", job.id)
          .order("created_at", { ascending: false });

        jobGroups.push({
          jobId: job.id,
          jobTitle: job.title,
          applicants: (apps as unknown as Applicant[]) ?? [],
        });
      }

      setGroups(jobGroups);
      if (jobGroups.length > 0) setExpanded(jobGroups[0].jobId);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleStatusChange(appId: string, newStatus: string) {
    await supabase
      .from("applications")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", appId);

    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        applicants: g.applicants.map((a) =>
          a.id === appId ? { ...a, status: newStatus } : a
        ),
      }))
    );
  }

  const totalApplicants = groups.reduce((sum, g) => sum + g.applicants.length, 0);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf7f2", padding: "2.5rem 1.5rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
              fontWeight: 800, color: "#1C1917", letterSpacing: "-0.025em",
              lineHeight: 1.1, marginBottom: "0.375rem",
            }}>
              Employer Dashboard
            </h1>
            {!loading && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "#78716C" }}>
                {groups.length === 0
                  ? "Post a job to start hiring"
                  : `${groups.length} job${groups.length !== 1 ? "s" : ""} · ${totalApplicants} applicant${totalApplicants !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>
          <Link
            href="/dashboard/employer/post-job"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              backgroundColor: "#FF5C2C", color: "#fff",
              fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "0.875rem",
              padding: "0.7rem 1.25rem", borderRadius: "10px", textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Post a Job
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[1, 2].map(i => (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "14px",
                border: "1px solid rgba(0,0,0,0.07)", padding: "1.25rem 1.5rem",
                height: 72, opacity: 0.6,
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && groups.length === 0 && <EmptyState />}

        {/* Job accordion cards */}
        {!loading && groups.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {groups.map((group) => {
              const isOpen = expanded === group.jobId;
              return (
                <div
                  key={group.jobId}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid rgba(0,0,0,0.07)",
                    overflow: "hidden",
                    boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.04)",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  {/* Card header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : group.jobId)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      justifyContent: "space-between", padding: "1.25rem 1.5rem",
                      background: "none", border: "none", cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: "10px",
                        backgroundColor: "#FEF0EB",
                        border: "1.5px solid rgba(255,92,44,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#FF5C2C" strokeWidth="1.5" />
                          <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="#FF5C2C" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p style={{
                          fontFamily: "var(--font-sans)", fontWeight: 600,
                          fontSize: "0.9375rem", color: "#1C1917", marginBottom: "0.15rem",
                        }}>
                          {group.jobTitle}
                        </p>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "#A8A29E" }}>
                          {group.applicants.length} applicant{group.applicants.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Chevron open={isOpen} />
                  </button>

                  {/* Applicant list */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                      {group.applicants.length === 0 ? (
                        <p style={{
                          padding: "1.5rem", fontFamily: "var(--font-sans)",
                          fontSize: "0.875rem", color: "#A8A29E", textAlign: "center",
                        }}>
                          No applications yet.
                        </p>
                      ) : (
                        group.applicants.map((app, idx) => {
                          const name = app.profiles?.full_name ?? "Unknown";
                          const st = statusStyle[app.status] ?? statusStyle.applied;
                          const isLast = idx === group.applicants.length - 1;
                          return (
                            <div
                              key={app.id}
                              style={{
                                display: "flex", alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1rem 1.5rem",
                                borderBottom: isLast ? "none" : "1px solid rgba(0,0,0,0.05)",
                                gap: "1rem", flexWrap: "wrap",
                              }}
                            >
                              {/* Left — identity */}
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                                <InitialAvatar name={name} />
                                <div style={{ minWidth: 0 }}>
                                  <p style={{
                                    fontFamily: "var(--font-sans)", fontWeight: 600,
                                    fontSize: "0.875rem", color: "#1C1917",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                  }}>
                                    {name}
                                  </p>
                                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "#A8A29E" }}>
                                    Applied {new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    {app.candidate_profiles?.strengths?.length
                                      ? ` · ${app.candidate_profiles.strengths.slice(0, 2).join(", ")}`
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              {/* Right — actions */}
                              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
                                {app.candidate_profiles?.resume_url && (
                                  <a
                                    href={app.candidate_profiles.resume_url}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                      fontFamily: "var(--font-sans)", fontSize: "0.8rem",
                                      fontWeight: 500, color: "#FF5C2C",
                                      textDecoration: "none", padding: "0.35rem 0.75rem",
                                      borderRadius: "6px", border: "1px solid rgba(255,92,44,0.2)",
                                      backgroundColor: "#FEF0EB",
                                    }}
                                  >
                                    Resume
                                  </a>
                                )}

                                <Link
                                  href={`/chat/${app.id}`}
                                  style={{
                                    fontFamily: "var(--font-sans)", fontSize: "0.8rem",
                                    fontWeight: 500, color: "#4B5563",
                                    textDecoration: "none", padding: "0.35rem 0.75rem",
                                    borderRadius: "6px", border: "1px solid rgba(0,0,0,0.1)",
                                    backgroundColor: "#F9FAFB",
                                  }}
                                >
                                  Chat
                                </Link>

                                {/* Status badge select */}
                                <div style={{ position: "relative" }}>
                                  <span style={{
                                    position: "absolute", left: "0.55rem", top: "50%",
                                    transform: "translateY(-50%)",
                                    width: 6, height: 6, borderRadius: "50%",
                                    backgroundColor: st.dot, pointerEvents: "none",
                                  }} />
                                  <select
                                    value={app.status}
                                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                    style={{
                                      fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                                      fontWeight: 500, color: st.text,
                                      backgroundColor: st.bg,
                                      border: "none", borderRadius: "6px",
                                      padding: "0.35rem 0.5rem 0.35rem 1.4rem",
                                      cursor: "pointer", outline: "none",
                                      appearance: "none", WebkitAppearance: "none",
                                    }}
                                  >
                                    {statusOptions.map((s) => (
                                      <option key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
