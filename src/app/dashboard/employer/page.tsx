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

export default function EmployerDashboard() {
  const supabase = createClient();
  const [groups, setGroups] = useState<JobGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get employer's jobs
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (!jobs) {
        setLoading(false);
        return;
      }

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

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link
            href="/dashboard/employer/post-job"
            className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Post a Job
          </Link>
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && groups.length === 0 && (
          <div className="text-center">
            <p className="mb-4 text-gray-500">No jobs posted yet.</p>
            <Link
              href="/dashboard/employer/post-job"
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              Post Your First Job
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.jobId} className="rounded-2xl bg-white shadow-sm">
              <button
                onClick={() =>
                  setExpanded((prev) =>
                    prev === group.jobId ? null : group.jobId
                  )
                }
                className="flex w-full items-center justify-between p-5"
              >
                <div className="text-left">
                  <h2 className="text-lg font-bold text-gray-900">
                    {group.jobTitle}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {group.applicants.length} applicant
                    {group.applicants.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-gray-400">
                  {expanded === group.jobId ? "▲" : "▼"}
                </span>
              </button>

              {expanded === group.jobId && (
                <div className="border-t border-gray-100 px-5 pb-5">
                  {group.applicants.length === 0 && (
                    <p className="py-4 text-sm text-gray-400">
                      No applications yet.
                    </p>
                  )}

                  {group.applicants.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between border-b border-gray-50 py-4 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {app.profiles?.full_name ?? "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(app.created_at).toLocaleDateString("en-IN")}
                          {app.candidate_profiles?.strengths &&
                            ` · ${app.candidate_profiles.strengths.join(", ")}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {app.candidate_profiles?.resume_url && (
                          <a
                            href={app.candidate_profiles.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary-600 hover:underline"
                          >
                            Resume
                          </a>
                        )}

                        <Link
                          href={`/chat/${app.id}`}
                          className="text-sm font-medium text-accent-600 hover:underline"
                        >
                          Chat
                        </Link>

                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value)
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1 text-sm outline-none focus:border-primary-500"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
