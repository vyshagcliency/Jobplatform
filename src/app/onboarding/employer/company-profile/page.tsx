"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const industries = [
  "Technology",
  "E-commerce",
  "EdTech",
  "FinTech",
  "HealthTech",
  "Marketing",
  "Media",
  "Consulting",
  "Manufacturing",
  "Retail",
  "Non-profit",
  "Other",
];

export default function CompanyProfilePage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [vibe, setVibe] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let logoUrl: string | null = null;

    if (logoFile) {
      const filePath = `${user.id}/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, logoFile);

      if (uploadError) {
        setError("Failed to upload logo.");
        setLoading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("logos").getPublicUrl(filePath);
      logoUrl = publicUrl;
    }

    const { error: insertError } = await supabase.from("companies").insert({
      employer_id: user.id,
      name,
      industry,
      vibe_description: vibe,
      logo_url: logoUrl,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Mark onboarding as completed now that company profile is set up
    await supabase
      .from("profiles")
      .update({ onboarding_status: "completed" })
      .eq("id", user.id);

    // Hard navigation — soft router.push can race with middleware/RSC fetch
    // and leave the user on a blank screen until they reload.
    window.location.href = "/dashboard/employer";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-warm-50 to-accent-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Set Up Your Company
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Tell candidates about your company so they know what to expect.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Logo (optional)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > 2 * 1024 * 1024) {
                  setError("Logo must be under 2MB.");
                  return;
                }
                setError("");
                setLogoFile(file ?? null);
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Industry
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            >
              <option value="">Select an industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Company Vibe
            </label>
            <textarea
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="What's it like working here? Describe your company culture..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={!name.trim() || loading}
            className="w-full rounded-lg bg-primary-600 py-3 text-lg font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Continue to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
