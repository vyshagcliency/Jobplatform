#!/usr/bin/env node
/**
 * One-time import script: loads jobspy CSVs into the `jobs` table as external jobs.
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL="https://rljdurgschhgcmnepxiq.supabase.co"
 *   export SUPABASE_SERVICE_ROLE_KEY="<service-role-key-from-supabase-dashboard>"
 *   node scripts/import-external-jobs.mjs
 *
 * The script:
 *   1. Parses both CSVs at the project root (handles quoted, multi-line fields).
 *   2. Dedupes across files by external_url (job_url_direct || job_url).
 *   3. Maps jobspy fields → jobs table columns.
 *   4. Upserts on `external_url` so re-running is idempotent.
 *
 * Requires migration 00008 to be applied (allows NULL company/employer/description
 * for external jobs and adds a unique index on external_url).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const CSV_FILES = [
  resolve(ROOT, "verified_freshers_india.csv"),
  resolve(ROOT, "strict_fresher_jobs_india (1).csv"),
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

// ─── CSV parser ──────────────────────────────────────────────────────────────
// Handles RFC-4180 basics: quoted fields, escaped quotes (""), newlines inside quotes.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows[0];
  return rows.slice(1)
    .filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (r[idx] ?? "").trim();
      });
      return obj;
    });
}

// ─── Field mapping ───────────────────────────────────────────────────────────
function mapRoleType(rawJobType, title) {
  const t = (title || "").toLowerCase();
  if (t.includes("intern")) return "internship";

  const jt = (rawJobType || "").toLowerCase().replace(/[^a-z]/g, "");
  if (jt === "fulltime" || jt === "permanent") return "full_time";
  if (jt === "contract" || jt === "temporary" || jt === "freelance") return "freelance";
  if (jt === "internship") return "internship";
  if (jt === "parttime") return "full_time";

  return "full_time";
}

function mapWorkStyle(isRemote, workFromHomeType, title) {
  const remote = String(isRemote || "").toLowerCase() === "true";
  if (remote) return "remote";
  const wfh = (workFromHomeType || "").toLowerCase();
  if (wfh.includes("hybrid")) return "hybrid";
  if (wfh.includes("remote")) return "remote";
  const t = (title || "").toLowerCase();
  if (t.includes("hybrid")) return "hybrid";
  if (t.includes("remote")) return "remote";
  return "in_office";
}

function mapSource(site) {
  const s = (site || "").toLowerCase();
  if (s === "linkedin") return "linkedin";
  if (s === "indeed") return "indeed";
  if (s === "naukri") return "naukri";
  return "other";
}

function parseSkills(raw) {
  if (!raw) return null;
  const parts = raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : null;
}

function emptyToNull(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function buildRow(csvRow) {
  const externalUrl = emptyToNull(csvRow.job_url_direct) || emptyToNull(csvRow.job_url);
  if (!externalUrl) return null;

  const title = emptyToNull(csvRow.title);
  if (!title) return null;

  return {
    title,
    description: emptyToNull(csvRow.description),
    role_type: mapRoleType(csvRow.job_type, csvRow.title),
    compensation: null, // not disclosed in these CSVs
    location: emptyToNull(csvRow.location),
    work_style: mapWorkStyle(csvRow.is_remote, csvRow.work_from_home_type, csvRow.title),
    skill_tags: parseSkills(csvRow.skills),
    deadline: null,
    status: "active",
    external_url: externalUrl,
    source: mapSource(csvRow.site),
    source_company_name: emptyToNull(csvRow.company),
    source_logo_url: emptyToNull(csvRow.company_logo),
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const dedup = new Map(); // external_url → row
  let totalRead = 0;
  let skipped = 0;

  for (const path of CSV_FILES) {
    const text = readFileSync(path, "utf8");
    const records = parseCSV(text);
    totalRead += records.length;
    console.log(`Parsed ${records.length} rows from ${path}`);

    for (const rec of records) {
      const row = buildRow(rec);
      if (!row) {
        skipped++;
        continue;
      }
      // First-file-wins dedup. LinkedIn listings come first; Indeed fills the gap.
      if (!dedup.has(row.external_url)) {
        dedup.set(row.external_url, row);
      }
    }
  }

  const rows = Array.from(dedup.values());
  console.log(
    `Total read: ${totalRead}, skipped (no url/title): ${skipped}, unique to upsert: ${rows.length}`,
  );

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const BATCH = 200;
  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error, count } = await supabase
      .from("jobs")
      .upsert(batch, { onConflict: "external_url", count: "exact" });
    if (error) {
      console.error(`Batch ${i / BATCH + 1} failed:`, error);
      process.exit(1);
    }
    upserted += count ?? batch.length;
    console.log(`Upserted batch ${i / BATCH + 1} (${batch.length} rows)`);
  }

  console.log(`Done. Upserted ${upserted} external jobs.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
