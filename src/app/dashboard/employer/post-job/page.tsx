"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roleType, setRoleType] = useState<"internship" | "full_time" | "freelance">("internship");
  const [compensation, setCompensation] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [workStyle, setWorkStyle] = useState<"remote" | "in_office" | "hybrid">("remote");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("skills")
      .select("name")
      .then(({ data }) => {
        if (data) setAllSkills(data.map((s) => s.name));
      });
  }, [supabase]);

  const isCompValid = typeof compensation === "number" && compensation > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (skillTags.length === 0) {
      setError("Select at least 1 skill tag.");
      return;
    }
    if (!isCompValid) return;

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Get employer's company
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("employer_id", user.id)
      .single();

    if (!company) {
      setError("Please set up your company profile first.");
      setLoading(false);
      return;
    }

    // Check duplicate title within 24h
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: dup } = await supabase
      .from("jobs")
      .select("id")
      .eq("employer_id", user.id)
      .eq("title", title)
      .gte("created_at", dayAgo)
      .limit(1);

    if (dup && dup.length > 0) {
      setError("You already posted a job with this title in the last 24 hours.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("jobs").insert({
      company_id: company.id,
      employer_id: user.id,
      title,
      description,
      role_type: roleType,
      compensation,
      location,
      work_style: workStyle,
      skill_tags: skillTags,
      deadline: deadline || null,
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/employer");
  }

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Post a Job</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as typeof roleType)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
              >
                <option value="internship">Internship</option>
                <option value="full_time">Full-time</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Compensation (INR) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={compensation}
                onChange={(e) =>
                  setCompensation(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
              />
              {compensation === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  Unpaid roles are not allowed on Underdog Jobs.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Work Style</label>
              <select
                value={workStyle}
                onChange={(e) => setWorkStyle(e.target.value as typeof workStyle)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
              >
                <option value="remote">Remote</option>
                <option value="in_office">In-office</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Skill Tags * (select at least 1)
            </label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => {
                const selected = skillTags.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      setSkillTags((prev) =>
                        selected
                          ? prev.filter((s) => s !== skill)
                          : [...prev, skill]
                      )
                    }
                    className={`rounded-full border-2 px-3 py-1 text-sm font-medium transition ${
                      selected
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-gray-300 text-gray-600 hover:border-primary-400"
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Application Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isCompValid || loading}
            title={!isCompValid ? "Why we don't allow unpaid roles" : undefined}
            className="w-full rounded-lg bg-primary-600 py-3 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
