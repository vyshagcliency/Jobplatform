# API Reference — Culture Hires

> All API routes, server actions, and Supabase client usage patterns.

## API Routes

### POST `/api/chat`

Generates onboarding messages for the AI chat interface.

**Request body:**
```json
{
  "role": "candidate" | "employer",
  "currentSection": 0,
  "previousAnswers": { "work_vibe": "startup_chaos", ... }
}
```

**Response (200):**
```json
{
  "message": "Hey! Welcome aboard...",
  "options": [
    { "label": "Structured corporate", "value": "structured_corporate" },
    { "label": "Startup chaos", "value": "startup_chaos" }
  ],
  "selectMode": "single" | "multi",
  "maxSelections": 2
}
```

**Response (400):**
```json
{ "error": "Invalid section" }
```

**Behavior:**
- If `ANTHROPIC_API_KEY` is set: calls Claude API (`claude-sonnet-4-5-20250929`) to generate a warm, casual question
- Falls back to predefined messages from `src/lib/onboarding-questions.ts` if API call fails or key not set
- Section configs: `candidateSections` (7 sections, 0-6) and `employerSections` (9 sections, 0-8)

**Source:** `src/app/api/chat/route.ts`

---

### GET `/auth/callback`

Handles OAuth callback (Google) and email confirmation links.

**Query params:**
| Param | Required | Description |
|-------|----------|-------------|
| `code` | Yes | Auth code from Supabase (exchanged for session) |
| `role` | No | `'candidate'` or `'employer'` — sets profile role for OAuth signups |

**Redirect logic:**
1. Exchanges `code` for session
2. Updates `profiles.role` if `role` param provided
3. Syncs `full_name` from Google metadata (only if profile `full_name` is null)
4. Checks profile status:
   - No profile → `/onboarding/{fallback_role}`
   - Ineligible → `/blocked`
   - Onboarding incomplete → `/onboarding/{role}`
   - Complete candidate → `/jobs`
   - Complete employer → `/dashboard/employer`
5. On error → `/login?error=auth`

**Source:** `src/app/auth/callback/route.ts`

---

## Server Actions

All server actions are in `src/lib/messages.ts` and use the `"use server"` directive.

### `sendMessage(senderId, receiverId, applicationId, content)`

Sends a chat message.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `senderId` | string | UUID of the sender |
| `receiverId` | string | UUID of the receiver |
| `applicationId` | string | UUID of the application (conversation thread) |
| `content` | string | Message text |

**Returns:** `{ error: string | null }`

**Business rules:**
- If no messages exist for this application, only the employer can send the first message
- Employer check: looks up `jobs.employer_id` via the application's `job_id`

---

### `getMessages(applicationId, cursor?)`

Retrieves messages for a conversation thread.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `applicationId` | string | UUID of the application |
| `cursor` | string? | ISO timestamp — fetches messages older than this |

**Returns:** `{ data: Message[], error: string | null }`

**Behavior:**
- Returns up to 50 messages, ordered by `created_at` ascending (newest last)
- Cursor-based pagination: pass the oldest message's `created_at` to load more

---

### `markAsRead(messageId)`

Marks a single message as read.

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `messageId` | string | UUID of the message |

**Returns:** `void`

**Note:** RLS ensures only the receiver can update a message.

---

## Supabase Client Patterns

### Browser-side (client components)

```typescript
import { createClient } from "@/lib/supabase/client";

// In component body (not in useEffect — memoize if needed)
const supabase = createClient();

// Query example
const { data, error } = await supabase
  .from("jobs")
  .select("*, companies(*)")
  .eq("status", "active");
```

**Source:** `src/lib/supabase/client.ts` — wraps `createBrowserClient` from `@supabase/ssr`

### Server-side (server components, API routes, server actions)

```typescript
import { createClient } from "@/lib/supabase/server";

// Must await (accesses cookies)
const supabase = await createClient();

const { data: { user } } = await supabase.auth.getUser();
```

**Source:** `src/lib/supabase/server.ts` — wraps `createServerClient` from `@supabase/ssr` with Next.js `cookies()` API

### Realtime Subscriptions

Used in Navbar (unread count) and chat pages:

```typescript
const channel = supabase
  .channel("channel-name")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `receiver_id=eq.${userId}`,
    },
    (payload) => { /* handle new message */ }
  )
  .subscribe();

// Cleanup
return () => { supabase.removeChannel(channel); };
```

---

## Onboarding Question Config

Defined in `src/lib/onboarding-questions.ts`.

### Interface

```typescript
interface OnboardingSection {
  id: number;
  field: string;           // Maps to DB column name
  message: string;         // Default question text
  options: { label: string; value: string }[];
  selectMode: "single" | "multi";
  maxSelections?: number;  // Only for multi-select
}
```

### Candidate Sections (0-6)

| ID | Field | Select Mode | Options Count |
|----|-------|-------------|---------------|
| 0 | `work_vibe` | single | 4 |
| 1 | `role_intent` | single | 4 |
| 2 | `skill_identity` | single | 6 |
| 3 | `job_preference` | single | 4 |
| 4 | `strengths` | multi (max 2) | 6 |
| 5 | `dealbreakers` | multi | 5 |
| 6 | `availability` | single | 4 |

### Employer Sections (0-8)

| ID | Field | Select Mode | Options Count |
|----|-------|-------------|---------------|
| 0 | `fresher_type` | single | 5 |
| 1 | `hiring_intent` | single | 5 |
| 2 | `company_context` | single | 5 |
| 3 | `role_category` | single | 8 |
| 4 | `top_skills` | multi (max 3) | 11 |
| 5 | `hiring_philosophy` | single | 5 |
| 6 | `candidate_type_pref` | single | 5 |
| 7 | `work_style` | single | 4 |
| 8 | `compensation_type` | single | 4 |
