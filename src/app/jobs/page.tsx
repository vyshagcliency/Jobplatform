"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Job {
  id: string;
  title: string;
  role_type: string;
  compensation: number;
  location: string;
  work_style: string;
  skill_tags: string[];
  created_at: string;
  companies: { name: string; logo_url: string | null };
}

const roleTypeLabels: Record<string, string> = {
  internship: "Internship",
  full_time: "Full-time",
  freelance: "Freelance",
};

const workStyleLabels: Record<string, string> = {
  remote: "Remote",
  in_office: "In-office",
  hybrid: "Hybrid",
};

const roleColors: Record<string, { bg: string; text: string }> = {
  internship: { bg: "#EFF6FF", text: "#2563EB" },
  full_time:  { bg: "#F0FDF4", text: "#16A34A" },
  freelance:  { bg: "#FDF4FF", text: "#A855F7" },
};

const styleColors: Record<string, { bg: string; text: string }> = {
  remote:    { bg: "#ECFDF5", text: "#059669" },
  in_office: { bg: "#FEF3C7", text: "#B45309" },
  hybrid:    { bg: "#EDE9FE", text: "#7C3AED" },
};

// Mock jobs shown when database is empty so the page doesn't look dead
const mockJobs: Job[] = [
  {
    id: "mock-1", title: "Frontend Developer Intern",
    role_type: "internship", compensation: 15000, location: "Bangalore",
    work_style: "hybrid", skill_tags: ["React", "JavaScript", "CSS"],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    companies: { name: "PixelCraft Studios", logo_url: null },
  },
  {
    id: "mock-2", title: "Marketing Associate",
    role_type: "full_time", compensation: 30000, location: "Mumbai",
    work_style: "in_office", skill_tags: ["Content Writing", "Marketing", "SEO"],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    companies: { name: "GrowthLoop", logo_url: null },
  },
  {
    id: "mock-3", title: "UI/UX Design Intern",
    role_type: "internship", compensation: 12000, location: "Remote",
    work_style: "remote", skill_tags: ["Figma", "UI/UX Design", "Prototyping"],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    companies: { name: "Designway", logo_url: null },
  },
  {
    id: "mock-4", title: "Data Analyst",
    role_type: "full_time", compensation: 35000, location: "Hyderabad",
    work_style: "hybrid", skill_tags: ["Python", "SQL", "Data Analysis"],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    companies: { name: "InsightGrid", logo_url: null },
  },
  {
    id: "mock-5", title: "Social Media Freelancer",
    role_type: "freelance", compensation: 20000, location: "Remote",
    work_style: "remote", skill_tags: ["Marketing", "Content Writing", "Communication"],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    companies: { name: "BrandSpark", logo_url: null },
  },
  {
    id: "mock-6", title: "Full-Stack Developer",
    role_type: "full_time", compensation: 45000, location: "Pune",
    work_style: "in_office", skill_tags: ["React", "Node.js", "PostgreSQL"],
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    companies: { name: "CodeNest", logo_url: null },
  },
];

function CompanyInitial({ name }: { name: string }) {
  const colors = ["#FF5C2C", "#2563EB", "#16A34A", "#A855F7", "#D97706", "#059669"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
      backgroundColor: colors[idx] + "14",
      border: `1.5px solid ${colors[idx]}22`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700,
      color: colors[idx],
    }}>
      {name[0]}
    </div>
  );
}

function formatPosted(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function JobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const [roleFilter, setRoleFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");

  async function loadJobs(pageNum: number, append = false) {
    setLoading(true);
    const from = pageNum * 20;

    let query = supabase
      .from("jobs")
      .select("id, title, role_type, compensation, location, work_style, skill_tags, created_at, companies(name, logo_url)")
      .order("created_at", { ascending: false })
      .range(from, from + 19);

    if (roleFilter) query = query.eq("role_type", roleFilter);
    if (styleFilter) query = query.eq("work_style", styleFilter);

    const { data } = await query;
    const results = (data as unknown as Job[]) ?? [];

    if (results.length === 0 && pageNum === 0 && !roleFilter && !styleFilter) {
      setJobs(mockJobs);
      setUsingMock(true);
      setHasMore(false);
    } else {
      if (append) {
        setJobs((prev) => [...prev, ...results]);
      } else {
        setJobs(results);
      }
      setUsingMock(false);
      setHasMore(results.length === 20);
    }

    setLoading(false);
  }

  useEffect(() => {
    setPage(0);
    loadJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, styleFilter]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadJobs(nextPage, true);
  }

  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "internship", label: "Internship" },
    { value: "full_time", label: "Full-time" },
    { value: "freelance", label: "Freelance" },
  ];

  const styleOptions = [
    { value: "", label: "All Styles" },
    { value: "remote", label: "Remote" },
    { value: "in_office", label: "In-office" },
    { value: "hybrid", label: "Hybrid" },
  ];

  const displayJobs = jobs.filter((j) => {
    if (usingMock) {
      if (roleFilter && j.role_type !== roleFilter) return false;
      if (styleFilter && j.work_style !== styleFilter) return false;
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#faf7f2", padding: "1.75rem 1.25rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
            fontWeight: 800, color: "#1C1917", letterSpacing: "-0.025em",
            lineHeight: 1.1, marginBottom: "0.3rem",
          }}>
            Find your role
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "#78716C" }}>
            Paid roles from companies that value your potential
            {usingMock && " · Showing sample listings"}
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.75rem" }}>
          {/* Role filters */}
          {roleOptions.map((opt) => {
            const active = roleFilter === opt.value;
            return (
              <button
                key={`role-${opt.value}`}
                onClick={() => setRoleFilter(opt.value)}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 500,
                  padding: "0.4rem 0.9rem", borderRadius: "999px",
                  border: active ? "1.5px solid #FF5C2C" : "1.5px solid rgba(0,0,0,0.1)",
                  backgroundColor: active ? "#FF5C2C" : "#ffffff",
                  color: active ? "#fff" : "#44403C",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ width: 1, height: 28, backgroundColor: "rgba(0,0,0,0.08)", margin: "0 0.25rem", alignSelf: "center" }} />

          {/* Style filters */}
          {styleOptions.map((opt) => {
            const active = styleFilter === opt.value;
            return (
              <button
                key={`style-${opt.value}`}
                onClick={() => setStyleFilter(opt.value)}
                style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 500,
                  padding: "0.4rem 0.9rem", borderRadius: "999px",
                  border: active ? "1.5px solid #FF5C2C" : "1.5px solid rgba(0,0,0,0.1)",
                  backgroundColor: active ? "#FF5C2C" : "#ffffff",
                  color: active ? "#fff" : "#44403C",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.875rem" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                backgroundColor: "#fff", borderRadius: "14px",
                border: "1px solid rgba(0,0,0,0.06)",
                height: 220, opacity: 0.4 + i * 0.1,
              }} />
            ))}
          </div>
        )}

        {/* Empty — only when filters exclude everything */}
        {!loading && displayJobs.length === 0 && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "4rem 1.5rem", textAlign: "center",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "18px",
              backgroundColor: "#FEF0EB", border: "1.5px solid rgba(255,92,44,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="#FF5C2C" strokeWidth="1.5" />
                <path d="M21 21l-4.35-4.35" stroke="#FF5C2C" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 700,
              color: "#1C1917", marginBottom: "0.4rem",
            }}>
              No matching jobs
            </h2>
            <p style={{
              fontFamily: "var(--font-sans)", fontSize: "0.875rem",
              color: "#78716C", lineHeight: 1.6, maxWidth: 300, marginBottom: "1.5rem",
            }}>
              Try removing a filter to see more opportunities.
            </p>
            <button
              onClick={() => { setRoleFilter(""); setStyleFilter(""); }}
              style={{
                fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600,
                color: "#FF5C2C", backgroundColor: "#FEF0EB",
                border: "1px solid rgba(255,92,44,0.2)",
                borderRadius: "10px", padding: "0.6rem 1.25rem", cursor: "pointer",
              }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Job grid */}
        {!loading && displayJobs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.875rem" }}>
            {displayJobs.map((job) => {
              const rc = roleColors[job.role_type] ?? { bg: "#F3F4F6", text: "#4B5563" };
              const sc = styleColors[job.work_style] ?? { bg: "#F3F4F6", text: "#4B5563" };
              const isMock = job.id.startsWith("mock-");
              const Wrapper = isMock ? "div" : Link;
              const wrapperProps = isMock ? {} : { href: `/jobs/${job.id}` };
              return (
                <Wrapper
                  key={job.id}
                  {...wrapperProps as Record<string, string>}
                  style={{
                    display: "flex", flexDirection: "column",
                    backgroundColor: "#ffffff", borderRadius: "14px",
                    border: "1px solid rgba(0,0,0,0.07)", padding: "1.25rem",
                    textDecoration: "none", transition: "box-shadow 0.15s, transform 0.15s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    cursor: isMock ? "default" : "pointer",
                  }}
                  className={isMock ? "" : "job-card"}
                >
                  {/* Company row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
                    {job.companies?.logo_url ? (
                      <img
                        src={job.companies.logo_url} alt=""
                        style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }}
                      />
                    ) : (
                      <CompanyInitial name={job.companies?.name ?? "?"} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 500,
                        color: "#78716C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {job.companies?.name}
                      </p>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "#A8A29E" }}>
                        {formatPosted(job.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: "var(--font-sans)", fontSize: "1rem", fontWeight: 700,
                    color: "#1C1917", lineHeight: 1.3, marginBottom: "0.625rem",
                    letterSpacing: "-0.01em",
                  }}>
                    {job.title}
                  </h3>

                  {/* Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.875rem" }}>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
                      padding: "0.2rem 0.6rem", borderRadius: "999px",
                      backgroundColor: rc.bg, color: rc.text,
                    }}>
                      {roleTypeLabels[job.role_type] ?? job.role_type}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
                      padding: "0.2rem 0.6rem", borderRadius: "999px",
                      backgroundColor: sc.bg, color: sc.text,
                    }}>
                      {workStyleLabels[job.work_style] ?? job.work_style}
                    </span>
                  </div>

                  {/* Skills */}
                  {job.skill_tags?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginBottom: "0.875rem" }}>
                      {job.skill_tags.slice(0, 3).map((tag) => (
                        <span key={tag} style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 500,
                          padding: "0.18rem 0.55rem", borderRadius: "6px",
                          backgroundColor: "#F5F5F4", color: "#78716C",
                          border: "1px solid rgba(0,0,0,0.05)",
                        }}>
                          {tag}
                        </span>
                      ))}
                      {job.skill_tags.length > 3 && (
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "0.68rem",
                          color: "#A8A29E", padding: "0.18rem 0.2rem",
                        }}>
                          +{job.skill_tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom row */}
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <p style={{
                      fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700,
                      color: "#1C1917", letterSpacing: "-0.01em",
                    }}>
                      ₹{job.compensation.toLocaleString("en-IN")}
                      <span style={{
                        fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                        fontWeight: 400, color: "#A8A29E", marginLeft: "0.2rem",
                      }}>/mo</span>
                    </p>
                    <p style={{
                      fontFamily: "var(--font-sans)", fontSize: "0.78rem",
                      color: "#78716C",
                    }}>
                      {job.location}
                    </p>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && !usingMock && (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button
              onClick={handleLoadMore}
              style={{
                fontFamily: "var(--font-sans)", fontSize: "0.875rem", fontWeight: 600,
                color: "#FF5C2C", backgroundColor: "#FEF0EB",
                border: "1px solid rgba(255,92,44,0.2)",
                borderRadius: "10px", padding: "0.65rem 1.5rem", cursor: "pointer",
              }}
            >
              Load more jobs
            </button>
          </div>
        )}
      </div>

      <style>{`
        .job-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
