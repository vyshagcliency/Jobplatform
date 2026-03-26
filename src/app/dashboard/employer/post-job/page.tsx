"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isExternal, setIsExternal] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  const [source, setSource] = useState("linkedin");
  const [sourceCompanyName, setSourceCompanyName] = useState("");
  const [sourceLogoUrl, setSourceLogoUrl] = useState("");

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
    if (isExternal && !externalUrl) {
      setError("External apply URL is required.");
      return;
    }
    if (isExternal && !sourceCompanyName) {
      setError("Company name is required for external jobs.");
      return;
    }

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
      ...(isExternal
        ? {
            external_url: externalUrl,
            source,
            source_company_name: sourceCompanyName,
            source_logo_url: sourceLogoUrl || null,
          }
        : {}),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/employer");
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500";

  return (
    <div className="min-h-screen bg-warm-50 px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Post a Job</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* External Job Toggle */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              role="switch"
              aria-checked={isExternal}
              onClick={() => setIsExternal(!isExternal)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                isExternal ? "bg-primary-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isExternal ? "translate-x-[22px]" : "translate-x-0.5"
                } mt-0.5`}
              />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-900">External Job</p>
              <p className="text-xs text-gray-500">
                Link to an external posting (LinkedIn, Naukri, company site)
              </p>
            </div>
          </div>

          {/* External Job Fields */}
          {isExternal && (
            <div className="space-y-4 rounded-xl border border-primary-200 bg-primary-50/50 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Flipkart, Zomato"
                  value={sourceCompanyName}
                  onChange={(e) => setSourceCompanyName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Company Logo URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={sourceLogoUrl}
                  onChange={(e) => setSourceLogoUrl(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  External Apply URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className={inputClass}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="naukri">Naukri</option>
                  <option value="indeed">Indeed</option>
                  <option value="company_website">Company Website</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value as typeof roleType)}
                className={inputClass}
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
                className={inputClass}
              />
              {compensation === 0 && (
                <p className="mt-1 text-xs text-red-500">
                  Unpaid roles are not allowed on Culture Hires.
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
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Work Style</label>
              <select
                value={workStyle}
                onChange={(e) => setWorkStyle(e.target.value as typeof workStyle)}
                className={inputClass}
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
              className={inputClass}
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
