"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  status: string;
  created_at: string;
  jobs: { title: string; companies: { name: string } };
}

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  shortlisted: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  hired: "bg-accent-100 text-accent-700",
  rejected: "bg-red-100 text-red-600",
};

export default function CandidateDashboard() {
  const supabase = createClient();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("applications")
        .select("id, status, created_at, jobs(title, companies(name))")
        .eq("candidate_id", user.id)
        .order("created_at", { ascending: false });

      setApplications((data as unknown as Application[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          My Applications
        </h1>

        {loading && <p className="text-gray-400">Loading...</p>}

        {!loading && applications.length === 0 && (
          <div className="text-center">
            <p className="mb-4 text-gray-500">No applications yet.</p>
            <Link
              href="/jobs"
              className="rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
            >
              Browse Jobs
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app.id}
              className="flex items-center justify-between rounded-xl bg-white p-5 shadow-sm"
            >
              <div>
                <h3 className="font-bold text-gray-900">
                  {app.jobs?.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {app.jobs?.companies?.name} &middot;{" "}
                  {new Date(app.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                  statusColors[app.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
