"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  role_type: string;
  compensation: number;
  location: string;
  work_style: string;
  skill_tags: string[];
  deadline: string;
  companies: { name: string; logo_url: string | null; vibe_description: string | null };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: jobData } = await supabase
        .from("jobs")
        .select("id, title, description, role_type, compensation, location, work_style, skill_tags, deadline, companies(name, logo_url, vibe_description)")
        .eq("id", jobId)
        .single();

      if (jobData) setJob(jobData as unknown as JobDetail);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: app } = await supabase
          .from("applications")
          .select("id")
          .eq("candidate_id", user.id)
          .eq("job_id", jobId)
          .single();
        if (app) setApplied(true);

        const { data: profile } = await supabase
          .from("candidate_profiles")
          .select("resume_url")
          .eq("user_id", user.id)
          .single();
        if (profile?.resume_url) setHasResume(true);
      }
    }
    load();
  }, [jobId, supabase, router]);

  async function handleApply() {
    if (!hasResume && !resumeFile) {
      setShowUpload(true);
      return;
    }

    setApplying(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (resumeFile) {
      const filePath = `${user.id}/${Date.now()}-${resumeFile.name}`;
      await supabase.storage.from("resumes").upload(filePath, resumeFile);
      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(filePath);
      await supabase
        .from("candidate_profiles")
        .update({ resume_url: publicUrl })
        .eq("user_id", user.id);
    }

    await supabase.from("applications").insert({
      candidate_id: user.id,
      job_id: jobId,
      status: "applied",
    });

    setApplied(true);
    setApplying(false);
    setShowUpload(false);
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/jobs"
          className="mb-6 inline-block text-sm text-primary-600 hover:underline"
        >
          &larr; Back to Jobs
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-4">
            {job.companies?.logo_url ? (
              <img
                src={job.companies.logo_url}
                alt=""
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-2xl font-bold text-primary-600">
                {job.companies?.name?.[0] ?? "?"}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-gray-500">{job.companies?.name}</p>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              {job.role_type === "full_time" ? "Full-time" : job.role_type === "internship" ? "Internship" : "Freelance"}
            </span>
            <span className="rounded-full bg-accent-100 px-3 py-1 text-sm font-medium text-accent-700">
              {job.work_style === "in_office" ? "In-office" : job.work_style === "remote" ? "Remote" : "Hybrid"}
            </span>
            <span className="rounded-full bg-warm-100 px-3 py-1 text-sm font-medium text-warm-700">
              ₹{job.compensation.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="mb-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-500">Location</span>
              <p className="text-gray-900">{job.location || "Not specified"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Deadline</span>
              <p className="text-gray-900">
                {job.deadline
                  ? new Date(job.deadline).toLocaleDateString("en-IN")
                  : "Open"}
              </p>
            </div>
          </div>

          {job.skill_tags && job.skill_tags.length > 0 && (
            <div className="mb-6">
              <span className="mb-2 block text-sm font-medium text-gray-500">
                Skills
              </span>
              <div className="flex flex-wrap gap-2">
                {job.skill_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              About the Role
            </h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {job.description}
            </p>
          </div>

          {job.companies?.vibe_description && (
            <div className="mb-8 rounded-xl bg-primary-50 p-6">
              <h3 className="mb-2 text-sm font-bold text-primary-700">
                Company Vibe
              </h3>
              <p className="text-sm text-gray-700">
                {job.companies.vibe_description}
              </p>
            </div>
          )}

          {showUpload && !hasResume && (
            <div className="mb-4 rounded-xl border border-gray-200 p-4">
              <p className="mb-2 text-sm text-gray-600">
                Upload your resume to apply (PDF, max 5MB)
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size <= 5 * 1024 * 1024)
                    setResumeFile(file);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              />
              {resumeFile && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                >
                  Upload & Apply
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleApply}
            disabled={applied || applying}
            className="w-full rounded-xl bg-primary-600 py-4 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {applied ? "Applied" : applying ? "Applying..." : "Quick Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
