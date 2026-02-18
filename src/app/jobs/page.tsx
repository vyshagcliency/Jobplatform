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

export default function JobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");

  async function loadJobs(pageNum: number, append = false) {
    setLoading(true);
    const from = pageNum * 20;

    let query = supabase
      .from("jobs")
      .select("id, title, role_type, compensation, location, work_style, skill_tags, created_at, companies(name, logo_url)")
      .eq("status", "active")
      .gte("deadline", new Date().toISOString().split("T")[0])
      .order("created_at", { ascending: false })
      .range(from, from + 19);

    if (roleFilter) query = query.eq("role_type", roleFilter);
    if (styleFilter) query = query.eq("work_style", styleFilter);

    const { data } = await query;
    const results = (data as unknown as Job[]) ?? [];

    if (append) {
      setJobs((prev) => [...prev, ...results]);
    } else {
      setJobs(results);
    }

    setHasMore(results.length === 20);
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

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Jobs</h1>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-primary-500"
          >
            <option value="">All Role Types</option>
            <option value="internship">Internship</option>
            <option value="full_time">Full-time</option>
            <option value="freelance">Freelance</option>
          </select>

          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-primary-500"
          >
            <option value="">All Work Styles</option>
            <option value="remote">Remote</option>
            <option value="in_office">In-office</option>
            <option value="hybrid">Hybrid</option>
          </select>

          {(roleFilter || styleFilter) && (
            <button
              onClick={() => {
                setRoleFilter("");
                setStyleFilter("");
              }}
              className="text-sm text-primary-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Job Cards */}
        {jobs.length === 0 && !loading && (
          <p className="text-center text-gray-500">
            No jobs match your filters. Try adjusting them!
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex items-center gap-3">
                {job.companies?.logo_url ? (
                  <img
                    src={job.companies.logo_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-lg font-bold text-primary-600">
                    {job.companies?.name?.[0] ?? "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-500">
                  {job.companies?.name}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-primary-600">
                {job.title}
              </h3>

              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {roleTypeLabels[job.role_type] ?? job.role_type}
                </span>
                <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-xs font-medium text-accent-700">
                  {workStyleLabels[job.work_style] ?? job.work_style}
                </span>
              </div>

              <p className="mb-1 text-lg font-semibold text-gray-900">
                ₹{job.compensation.toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-gray-500">{job.location}</p>
            </Link>
          ))}
        </div>

        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="rounded-xl border border-primary-600 px-6 py-2 font-medium text-primary-600 transition hover:bg-primary-50"
            >
              Load More
            </button>
          </div>
        )}

        {loading && (
          <p className="mt-8 text-center text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
}
