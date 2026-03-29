# Architecture — Culture Hires

> System design reference. For quick project setup, see [`../CLAUDE.md`](../CLAUDE.md).

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Browser)                     │
│  Next.js App Router — React 19 — Tailwind CSS 4         │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Landing  │ │   Auth   │ │Onboard  │ │  Dashboard   │ │
│  │  page    │ │  pages   │ │  chat   │ │ + Jobs + Chat│ │
│  └─────────┘ └──────────┘ └─────────┘ └──────────────┘ │
│         │          │            │              │         │
│         ▼          ▼            ▼              ▼         │
│  ┌────────────────────────────────────────────────────┐ │
│  │          Supabase Client (@supabase/ssr)           │ │
│  │   Browser: createBrowserClient (client.ts)         │ │
│  │   Server:  createServerClient  (server.ts)         │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Supabase    │ │  Supabase    │ │  Supabase    │
│  Auth        │ │  PostgreSQL  │ │  Storage     │
│  (Email+OTP  │ │  (RLS-       │ │  (resumes/   │
│   +Google)   │ │   protected) │ │   logos/)    │
└──────────────┘ └──────┬───────┘ └──────────────┘
                        │
                        ▼
                ┌──────────────┐
                │  Supabase    │
                │  Realtime    │
                │  (messages)  │
                └──────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Next.js API Routes                      │
│  POST /api/chat ──► Anthropic Claude API (optional)     │
│  GET /auth/callback ──► Supabase Auth code exchange     │
└─────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Every Request (Middleware)

```
Request → middleware.ts
  ├── Public route? (/,/signup,/login,/verify-otp,/blocked,/onboarding/*,/api/*,/_next/*) → PASS
  ├── No auth session? → Redirect /login
  ├── Profile fetch
  │   ├── fetch error → Redirect /onboarding/candidate
  │   ├── eligibility = 'ineligible' → Redirect /blocked
  │   ├── onboarding != 'completed' → Redirect /onboarding/{role}
  │   └── OK → PASS
  └── Return response (with refreshed cookies)
```

### 2. Authentication Flow

```
Signup (email/password)
  ├── Client: supabase.auth.signUp({ email, password, options: { data: { full_name, role } } })
  ├── Supabase: sends OTP email
  ├── DB trigger: handle_new_user() creates profiles row
  └── Client: redirect to /verify-otp

Verify OTP
  ├── Client: supabase.auth.verifyOtp({ email, token, type: 'signup' })
  └── Client: redirect to /onboarding/{role}

Google OAuth
  ├── Client: supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin/auth/callback?role={role} } })
  ├── Google: authenticates user
  ├── Supabase: creates auth.users row → trigger creates profiles row
  ├── Callback route: exchanges code for session
  ├── Callback route: updates role if ?role param present
  ├── Callback route: syncs full_name from Google metadata
  └── Callback route: redirects based on profile status
```

### 3. Onboarding Flow

```
Candidate:
  Section 0: work_vibe (single)
  Section 1: role_intent (single)
  Section 2: skill_identity (single)
  Section 3: job_preference (single)
  Section 4: strengths (multi, pick 2)
  Section 5: dealbreakers (multi)
  Section 6: availability (single)
  ──── College Gate ────
  Section 7: College search → Tier-1? → /blocked (eligibility='ineligible')
  Section 8: Resume upload + portfolio links
  ──── Complete ────
  → profiles.onboarding_status = 'completed'
  → Redirect to /jobs

Employer:
  Section 0: fresher_type (single)
  Section 1: hiring_intent (single)
  Section 2: company_context (single)
  Section 3: role_category (single)
  Section 4: top_skills (multi, pick 3)
  Section 5: hiring_philosophy (single)
  Section 6: candidate_type_pref (single)
  Section 7: work_style (single)
  Section 8: compensation_type (single)
  ──── Company Profile ────
  → /onboarding/employer/company-profile
  → profiles.onboarding_status = 'completed'
  → Redirect to /dashboard/employer
```

### 4. Chat/Messaging Flow

```
Employer clicks "Open Chat" on an application
  → /chat/{applicationId}
  → First message: only employer can send (server-side check in messages.ts)
  → Supabase Realtime: both parties subscribe to postgres_changes on messages table
  → Messages displayed in real-time
  → Unread count tracked via Navbar subscription
```

## Component Architecture

### Page Types

| Page | Rendering | Data Source |
|------|-----------|-------------|
| `/` (Landing) | Server Component | Static |
| `/login`, `/signup` | Client Component | Supabase Auth |
| `/verify-otp` | Client Component | Supabase Auth |
| `/onboarding/*` | Client Component | `/api/chat` + Supabase DB |
| `/jobs` | Client Component | Supabase DB (jobs + companies) |
| `/jobs/[id]` | Client Component | Supabase DB |
| `/dashboard/*` | Client Component | Supabase DB |
| `/chat/*` | Client Component | Supabase DB + Realtime |

### Shared Components

```
Navbar (client component)
  ├── Loads user profile + role
  ├── Shows role-specific links
  ├── Real-time unread message count (Supabase channel subscription)
  └── Mobile hamburger menu

ChatUI (client component)
  ├── AiMessage — typewriter text animation
  ├── PillOptions — single/multi-select answer bubbles
  └── TypingIndicator — three-dot bounce animation
```

### Supabase Client Usage Pattern

```typescript
// Browser-side (client components)
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();  // uses createBrowserClient

// Server-side (server components, API routes, server actions)
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();  // uses createServerClient + cookies()

// Middleware
// Creates its own client inline (cannot use cookies() API)
```

## Data Model Overview

See [`DATABASE.md`](DATABASE.md) for full schema details.

```
auth.users (Supabase managed)
  │
  ├── 1:1 ── profiles (role, onboarding_status, eligibility, full_name)
  │             │
  │             ├── 1:1 ── candidate_profiles (onboarding answers, resume, links)
  │             │             └── N:1 ── colleges (name, tier, state, type)
  │             │
  │             ├── 1:1 ── employer_profiles (onboarding answers)
  │             │
  │             ├── 1:N ── companies (name, logo, industry, vibe)
  │             │             └── 1:N ── jobs (title, compensation, skill_tags, status)
  │             │                          └── 1:N ── applications (status pipeline)
  │             │                                       ├── 1:N ── messages
  │             │                                       └── 0:1 ── hire_feedback
  │             │
  │             └── messages (sender_id / receiver_id)
  │
  └── trigger: handle_new_user() → INSERT INTO profiles
```

## Security Model

### Row-Level Security (RLS)

Every table has RLS enabled. Key policies:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own row only | Own row only | Own row only | — |
| candidate_profiles | Own row only | Own row only | Own row only | — |
| employer_profiles | Own row only | Own row only | Own row only | — |
| colleges | All authenticated | — | — | — |
| skills | All authenticated | — | — | — |
| companies | All authenticated | Own only | Own only | Own only |
| jobs | Active jobs (all auth) | Own only | Own only | Own only |
| applications | Candidates: own; Employers: their jobs' apps | Candidates: own | Employers: their jobs' apps | — |
| messages | Sender or receiver | Sender only | Receiver only (mark read) | — |
| hire_feedback | Involved parties | Employer only | — | — |

### Storage Policies

- **resumes/**: Users upload to `{user_id}/` folder; publicly readable
- **logos/**: Users upload to `{user_id}/` folder; publicly readable

### Middleware Guards

1. Unauthenticated → `/login`
2. Ineligible (Tier-1) → `/blocked`
3. Incomplete onboarding → `/onboarding/{role}`

## Deployment

- **Target:** Vercel (Next.js optimized)
- **Required env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Optional env vars:** `ANTHROPIC_API_KEY` (LLM onboarding)
- **Database:** Supabase hosted PostgreSQL
- **Migrations:** Applied via `supabase db push` (Supabase CLI)
- **Seed data:** `supabase/seed.sql` (800+ colleges, 11 skills)
