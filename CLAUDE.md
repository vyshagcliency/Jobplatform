# CLAUDE.md — Culture Hires (Underdog Jobs)

> Project guide for Claude Code and human developers. Read this before making any changes.

## Project Overview

**Culture Hires** (package name: `underdog-jobs`) is a hiring platform exclusively for Tier-2 and Tier-3 college freshers in India. It blocks Tier-1 college candidates, enforces paid-only jobs, and uses LLM-powered conversational onboarding instead of traditional forms.

- **Live Supabase project:** `rljdurgschhgcmnepxiq.supabase.co`
- **GitHub:** `vyshagcliency/Jobplatform`
- **Branch strategy:** `main` is the primary branch

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| Language | TypeScript (strict mode) | 5.9.3 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS 4 + inline React styles | 4.1.18 |
| Database | Supabase PostgreSQL + RLS | — |
| Auth | Supabase Auth (email/OTP + Google OAuth) | — |
| Realtime | Supabase Realtime channels | — |
| Storage | Supabase Storage (resumes, logos) | — |
| AI | Anthropic Claude API (optional) | claude-sonnet-4-5 |
| Deployment | Vercel | — |

## Quick Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run typecheck  # TypeScript check (tsc --noEmit)
```

**Database migrations:** Run via Supabase CLI (`supabase db push`) — migrations are in `supabase/migrations/`.

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — enables LLM-powered onboarding messages
ANTHROPIC_API_KEY=your-anthropic-key
```

See `.env.local.example` for the template.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts + Navbar)
│   ├── page.tsx                  # Landing page (/)
│   ├── globals.css               # Tailwind + theme CSS
│   ├── api/chat/route.ts         # POST /api/chat — onboarding AI
│   ├── auth/callback/route.ts    # GET /auth/callback — OAuth handler
│   ├── login/page.tsx            # Email/password login
│   ├── signup/page.tsx           # Signup with role toggle
│   ├── verify-otp/page.tsx       # OTP verification
│   ├── blocked/page.tsx          # Tier-1 block screen
│   ├── onboarding/
│   │   ├── candidate/page.tsx    # Candidate chat onboarding (7 sections)
│   │   └── employer/
│   │       ├── page.tsx          # Employer chat onboarding (9 sections)
│   │       └── company-profile/page.tsx
│   ├── jobs/
│   │   ├── page.tsx              # Job listing feed
│   │   └── [id]/page.tsx         # Job detail + apply
│   ├── dashboard/
│   │   ├── candidate/page.tsx    # Candidate applications
│   │   └── employer/
│   │       ├── page.tsx          # Employer dashboard (jobs + applicants)
│   │       └── post-job/page.tsx # Job creation form
│   └── chat/
│       ├── page.tsx              # Conversation list
│       └── [applicationId]/page.tsx
├── components/
│   ├── Navbar.tsx                # Sticky nav — role-aware, unread badge
│   └── chat/ChatUI.tsx           # Reusable chat components
├── lib/
│   ├── supabase/client.ts        # Browser Supabase client
│   ├── supabase/server.ts        # Server Supabase client
│   ├── messages.ts               # Server actions: sendMessage, getMessages, markAsRead
│   └── onboarding-questions.ts   # Candidate (7) + employer (9) question configs
└── middleware.ts                 # Auth guard + onboarding redirect + eligibility gate
```

```
supabase/
├── migrations/
│   ├── 00001_profiles_colleges_skills.sql
│   ├── 00002_companies_jobs_applications_messages.sql
│   ├── 00003_hire_feedback.sql
│   ├── 00004_auto_create_profile.sql
│   ├── 00005_external_jobs.sql
│   └── 00006_storage_buckets.sql
└── seed.sql                      # Skills + 800+ Indian colleges (Tier 1/2/3)
```

## Key Conventions

### Code Style
- **TypeScript strict mode** — no `any` without justification
- **Path alias:** `@/*` maps to `./src/*`
- **Components:** Client components use `"use client"` directive; server components are the default
- **Styling:** Mix of Tailwind utilities and inline React `style` objects. No CSS modules.
- **Fonts:** `--font-display` = Fraunces (serif, headlines), `--font-sans` = DM Sans (body text)

### Design System Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Brand/Lime | `#BBFF3B` | Primary buttons, accents |
| Orange | `#FF5C2C` | Secondary accent, alerts, unread badges |
| Text | `#1C1917` | Primary text (light theme) |
| Muted | `#78716C` | Secondary/helper text |
| Background | `#faf7f2` | Warm cream page background |

### Auth & Routing
- **Middleware** (`src/middleware.ts`) protects all routes except: `/`, `/signup`, `/login`, `/verify-otp`, `/blocked`, `/onboarding/*`, `/api/*`
- Unauthenticated users → redirected to `/login`
- Ineligible users (Tier-1) → redirected to `/blocked`
- Incomplete onboarding → redirected to `/onboarding/{role}`
- After onboarding: candidates → `/jobs`, employers → `/dashboard/employer`

### Database Patterns
- **RLS is always on.** Every table has row-level security policies.
- **`profiles` table** extends `auth.users` — created automatically via `handle_new_user()` trigger
- **User-scoped storage:** Files uploaded to `{user_id}/filename` paths
- **Candidate onboarding fields** map 1:1 to `candidateSections` in `onboarding-questions.ts`
- **Employer onboarding fields** map 1:1 to `employerSections` in `onboarding-questions.ts`

### Chat System
- Chat is **employer-initiated only** — candidates cannot send the first message
- Real-time via Supabase channels (postgres_changes)
- Cursor-based pagination (50 messages per page)
- Server actions in `src/lib/messages.ts`

### External Jobs
- Jobs with `external_url` set are external (redirect to source)
- Native jobs have `external_url = null`
- Fields: `source`, `source_company_name`, `source_logo_url`

## Related Documentation

| Document | Path | Description |
|----------|------|-------------|
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data flow diagrams, component hierarchy |
| Database Schema | [`docs/DATABASE.md`](docs/DATABASE.md) | All tables, columns, RLS policies, triggers |
| API Reference | [`docs/API.md`](docs/API.md) | Routes, server actions, request/response formats |
| Product Requirements | [`tasks/prd-freshers-hiring-platform.md`](tasks/prd-freshers-hiring-platform.md) | Full PRD with user stories and acceptance criteria |

## Common Gotchas

1. **Profile trigger timing:** The `handle_new_user()` trigger runs on `auth.users` INSERT. For Google OAuth, the profile may not exist immediately when the callback runs — the code handles this with a fallback redirect.

2. **RLS + full_name sync:** The `profiles` table RLS requires `auth.uid() = id`. Updating `full_name` from Google metadata uses `.is("full_name", null)` to avoid overwriting user-set names.

3. **Compensation validation:** The `jobs.compensation` column has a `CHECK (compensation > 0)` constraint — unpaid roles are rejected at the database level.

4. **College search:** Uses `pg_trgm` extension with a GIN index on `colleges.name` for fast partial-text search.

5. **Middleware skips onboarding routes:** This is intentional — users need to access onboarding pages even when their `onboarding_status` is not `completed`.

6. **Supabase client in components:** Browser-side uses `createBrowserClient` from `@supabase/ssr`; server-side uses `createServerClient` with the `cookies()` API. Never mix them.

7. **Image remote patterns:** Only `images.unsplash.com` is configured in `next.config.ts`. Add new domains there if needed.
