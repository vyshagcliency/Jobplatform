# Database Schema — Culture Hires

> Complete reference for all tables, columns, constraints, RLS policies, triggers, and storage buckets.
> Migrations live in `supabase/migrations/`. Seed data in `supabase/seed.sql`.

## Tables Overview

| Table | Migration | Purpose |
|-------|-----------|---------|
| `profiles` | 00001 | Extends `auth.users` — role, onboarding status, eligibility |
| `colleges` | 00001 | Indian colleges with tier classification (1/2/3) |
| `skills` | 00001 | Predefined skill tags |
| `candidate_profiles` | 00001 | Candidate onboarding answers, resume, portfolio links |
| `employer_profiles` | 00001 | Employer onboarding answers |
| `companies` | 00002 | Employer company profiles |
| `jobs` | 00002 + 00005 | Job postings (native + external) |
| `applications` | 00002 | Candidate job applications with pipeline status |
| `messages` | 00002 | Chat messages between employers and candidates |
| `hire_feedback` | 00003 | Post-hire feedback from employers |

## Detailed Schema

### `profiles`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK, FK → auth.users(id) ON DELETE CASCADE | — |
| `role` | TEXT | NOT NULL, CHECK ('candidate' \| 'employer') | — |
| `onboarding_status` | TEXT | NOT NULL, CHECK ('pending' \| 'in_progress' \| 'completed') | `'pending'` |
| `eligibility` | TEXT | NOT NULL, CHECK ('eligible' \| 'ineligible') | `'eligible'` |
| `full_name` | TEXT | NOT NULL | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**RLS Policies:**
- SELECT: `auth.uid() = id`
- UPDATE: `auth.uid() = id`
- INSERT: `auth.uid() = id`

**Trigger:** `handle_new_user()` (migration 00004) — automatically creates a profile row when a new `auth.users` row is inserted. Uses `SECURITY DEFINER` to bypass RLS. Reads `role` and `full_name` from `raw_user_meta_data`.

---

### `colleges`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `name` | TEXT | NOT NULL, UNIQUE (from seed.sql) | — |
| `tier` | INT | NOT NULL, CHECK (1 \| 2 \| 3) | — |
| `state` | TEXT | — | — |
| `type` | TEXT | NOT NULL, CHECK ('IIT' \| 'NIT' \| 'IIIT' \| 'BITS' \| 'IISc' \| 'Private' \| 'State' \| 'Deemed' \| 'Other') | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**Index:** `idx_colleges_name` — GIN index using `pg_trgm` for fast partial-text search.

**Extension required:** `pg_trgm`

**RLS Policies:**
- SELECT: `auth.role() = 'authenticated'`

**Seed data:** 800+ colleges — 23 IITs, 31 NITs, 26 IIITs, 5 BITS/IISc (all Tier-1), ~250 Tier-2, ~300+ Tier-3.

---

### `skills`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `name` | TEXT | NOT NULL, UNIQUE | — |
| `category` | TEXT | — | — |

**RLS Policies:**
- SELECT: `auth.role() = 'authenticated'`

**Seed data:** Python, Java, Web Development, UI/UX Design, Content Writing, Influencer Marketing, Sales/Outreach, Data Analysis, Operations, Product Thinking, Communication.

---

### `candidate_profiles`

| Column | Type | Constraints | Default | Onboarding Section |
|--------|------|-------------|---------|-------------------|
| `id` | UUID | PK | `gen_random_uuid()` | — |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → profiles(id) ON DELETE CASCADE | — | — |
| `work_vibe` | TEXT | — | — | Section 0 |
| `role_intent` | TEXT | — | — | Section 1 |
| `skill_identity` | TEXT | — | — | Section 2 |
| `job_preference` | TEXT | — | — | Section 3 |
| `strengths` | TEXT[] | — | — | Section 4 (multi, max 2) |
| `dealbreakers` | TEXT[] | — | — | Section 5 (multi) |
| `availability` | TEXT | — | — | Section 6 |
| `college_id` | UUID | FK → colleges(id) | — | Section 7 (college gate) |
| `resume_url` | TEXT | — | — | Section 8 |
| `github_url` | TEXT | — | — | Section 8 |
| `linkedin_url` | TEXT | — | — | Section 8 |
| `portfolio_url` | TEXT | — | — | Section 8 |
| `projects` | JSONB | — | — | Section 8 |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — |

**RLS Policies:**
- SELECT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`

---

### `employer_profiles`

| Column | Type | Constraints | Default | Onboarding Section |
|--------|------|-------------|---------|-------------------|
| `id` | UUID | PK | `gen_random_uuid()` | — |
| `user_id` | UUID | NOT NULL, UNIQUE, FK → profiles(id) ON DELETE CASCADE | — | — |
| `fresher_type` | TEXT | — | — | Section 0 |
| `hiring_intent` | TEXT | — | — | Section 1 |
| `company_context` | TEXT | — | — | Section 2 |
| `role_category` | TEXT | — | — | Section 3 |
| `top_skills` | TEXT[] | — | — | Section 4 (multi, max 3) |
| `hiring_philosophy` | TEXT | — | — | Section 5 |
| `candidate_type_pref` | TEXT | — | — | Section 6 |
| `work_style` | TEXT | — | — | Section 7 |
| `city` | TEXT | — | — | Section 7 (city input) |
| `compensation_type` | TEXT | — | — | Section 8 |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` | — |

**RLS Policies:**
- SELECT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`

---

### `companies`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `employer_id` | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE | — |
| `name` | TEXT | NOT NULL | — |
| `logo_url` | TEXT | — | — |
| `industry` | TEXT | — | — |
| `vibe_description` | TEXT | — | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**RLS Policies:**
- ALL: `auth.uid() = employer_id` (employers manage own)
- SELECT: `auth.role() = 'authenticated'` (all can read)

---

### `jobs`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `company_id` | UUID | FK → companies(id) ON DELETE CASCADE (nullable for external, see 00008) | — |
| `employer_id` | UUID | FK → profiles(id) ON DELETE CASCADE (nullable for external, see 00008) | — |
| `title` | TEXT | NOT NULL | — |
| `description` | TEXT | nullable for external jobs (see 00008) | — |
| `role_type` | TEXT | CHECK ('internship' \| 'full_time' \| 'freelance'), nullable (00007) | — |
| `compensation` | INTEGER | CHECK (> 0), nullable (00007) | — |
| `location` | TEXT | — | — |
| `work_style` | TEXT | CHECK ('remote' \| 'in_office' \| 'hybrid'), nullable (00007) | — |
| `skill_tags` | TEXT[] | — | — |
| `deadline` | DATE | — | — |
| `status` | TEXT | NOT NULL, CHECK ('active' \| 'filled' \| 'expired') | `'active'` |
| `external_url` | TEXT | — (added in 00005) | — |
| `source` | TEXT | — (added in 00005) | — |
| `source_company_name` | TEXT | — (added in 00005) | — |
| `source_logo_url` | TEXT | — (added in 00005) | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**Check constraint `jobs_native_requires_core_fields` (00008):**
```sql
external_url IS NOT NULL
OR (company_id IS NOT NULL AND employer_id IS NOT NULL AND description IS NOT NULL)
```
Native jobs still require company, employer, and description. External jobs (jobs scraped from LinkedIn/Indeed/etc.) may skip these.

**Unique partial index `jobs_external_url_unique` (00008):** prevents duplicate external job imports on re-runs. Only applies where `external_url IS NOT NULL`.

**RLS Policies:**
- ALL: `auth.uid() = employer_id` (employers manage own) — external jobs have NULL employer_id so no one can manage them via RLS; they can only be inserted/updated using the service role (e.g. via `scripts/import-external-jobs.mjs`).
- SELECT: `auth.role() = 'authenticated' AND status = 'active'` (only active jobs visible)

**Note:** External jobs have `external_url` set. Native platform jobs have it as `null`. The candidate UI redirects to `external_url` instead of showing the Quick Apply flow for external jobs.

---

### `applications`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `candidate_id` | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE | — |
| `job_id` | UUID | NOT NULL, FK → jobs(id) ON DELETE CASCADE | — |
| `status` | TEXT | NOT NULL, CHECK ('applied' \| 'shortlisted' \| 'interview' \| 'offer' \| 'hired' \| 'rejected') | `'applied'` |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |
| `updated_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**Unique constraint:** `(candidate_id, job_id)` — prevents duplicate applications.

**RLS Policies:**
- ALL: `auth.uid() = candidate_id` (candidates manage own)
- SELECT: employer owns the job (via JOIN on jobs)
- UPDATE: employer owns the job (via JOIN on jobs)

**Pipeline stages:** applied → shortlisted → interview → offer → hired (or rejected at any stage)

---

### `messages`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `sender_id` | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE | — |
| `receiver_id` | UUID | NOT NULL, FK → profiles(id) ON DELETE CASCADE | — |
| `application_id` | UUID | NOT NULL, FK → applications(id) ON DELETE CASCADE | — |
| `content` | TEXT | NOT NULL | — |
| `is_read` | BOOLEAN | NOT NULL | `FALSE` |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**RLS Policies:**
- SELECT: `auth.uid() = sender_id OR auth.uid() = receiver_id`
- INSERT: `auth.uid() = sender_id`
- UPDATE: `auth.uid() = receiver_id` (mark as read only)

**App-level constraint:** First message must be sent by the employer (enforced in `src/lib/messages.ts`, not at DB level).

---

### `hire_feedback`

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| `id` | UUID | PK | `gen_random_uuid()` |
| `application_id` | UUID | NOT NULL, UNIQUE, FK → applications(id) ON DELETE CASCADE | — |
| `rating` | INTEGER | NOT NULL, CHECK (>= 1 AND <= 5) | — |
| `comment` | TEXT | CHECK (char_length <= 280) | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | `NOW()` |

**RLS Policies:**
- INSERT: employer owns the job (via JOIN on applications → jobs)
- SELECT: employer or candidate involved (via JOIN on applications → jobs)

---

## Storage Buckets

| Bucket | Public | Upload Policy | Purpose |
|--------|--------|--------------|---------|
| `resumes` | Yes | Authenticated, own folder (`{user_id}/`) | Candidate resume PDFs |
| `logos` | Yes | Authenticated, own folder (`{user_id}/`) | Company logo images |

Both buckets allow INSERT and UPDATE for authenticated users uploading to their own `{user_id}/` folder, and public SELECT for all.

---

## Triggers & Functions

### `handle_new_user()`
- **Migration:** 00004
- **Trigger:** `on_auth_user_created` — AFTER INSERT ON `auth.users`
- **Security:** DEFINER (bypasses RLS)
- **Logic:** Creates a `profiles` row using `raw_user_meta_data` for `role` (defaults to 'candidate') and `full_name` (defaults to '')

---

## Migration Order

1. **00001** — profiles, colleges, skills, candidate_profiles, employer_profiles + RLS
2. **00002** — companies, jobs, applications, messages + RLS
3. **00003** — hire_feedback + RLS
4. **00004** — handle_new_user() trigger
5. **00005** — External job fields on jobs table
6. **00006** — Storage buckets (resumes, logos) + storage policies
