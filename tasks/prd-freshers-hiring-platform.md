# PRD: Tier-2 & Tier-3 Freshers-Only Hiring Platform

**Codename:** Underdog Jobs
**Version:** MVP v1.0
**Stack:** Next.js + Supabase (Auth, DB, Realtime) + Vercel
**AI Chat:** LLM-powered onboarding (Claude/GPT)
**Matching:** Deferred to post-MVP (MVP shows all relevant jobs)

---

## Introduction / Overview

A hiring marketplace built exclusively for students and fresh graduates from Tier-2 and Tier-3 colleges in India. The platform programmatically blocks Tier-1 college candidates, enforces paid-only job postings, and replaces boring signup forms with an LLM-powered conversational onboarding ("Vibe Check") for both candidates and employers. The goal is to create a level playing field where talent from non-elite colleges gets discovered on merit, attitude, and skill — not college brand.

---

## Goals

- Give Tier-2/3 freshers a dedicated space where they are not competing against IIT/NIT graduates
- Replace traditional form-based onboarding with an engaging, chat-style AI questionnaire
- Enforce fair hiring practices: no unpaid roles, no experience requirements
- Enable direct recruiter-to-candidate chat to speed up hiring
- Launch a functional MVP covering: auth, AI onboarding, job posting, job discovery, application, and chat

---

## User Stories

### US-001: Candidate Signup & OTP Verification
**Description:** As a candidate, I want to sign up with my email and verify via OTP so that my account is trusted.

**Acceptance Criteria:**
- [ ] Signup form collects Full Name, Email, Password
- [ ] Password requires minimum 8 characters; email validated for format
- [ ] On submit, a 6-digit OTP is sent to the email via Supabase Auth
- [ ] OTP input screen appears with 6 separate digit fields
- [ ] 60-second cooldown before "Resend OTP" button becomes active
- [ ] Invalid/expired OTP shows red inline error text
- [ ] Successful verification redirects to the AI onboarding chat
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-002: Employer Signup & OTP Verification
**Description:** As an employer/recruiter, I want to sign up and verify my email so I can start hiring.

**Acceptance Criteria:**
- [ ] Signup form collects Full Name, Company Email, Password
- [ ] Same OTP verification flow as candidate (Supabase Auth)
- [ ] Successful verification redirects to the Employer AI onboarding chat
- [ ] User role stored as `employer` in the database
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-003: Candidate AI Onboarding Chat (Sections 0-6)
**Description:** As a candidate, I want to complete a conversational AI questionnaire so the platform understands my skills, preferences, and vibe without filling out boring forms.

**Acceptance Criteria:**
- [ ] Full-screen chat interface appears after OTP verification
- [ ] LLM generates warm, casual, dating-app-style messages following the scripted question bank (Sections 0-6)
- [ ] Each question presents tap-able pill/bubble options to reduce typing
- [ ] Section 0 (Warm-up): Work vibe — 4 options (structured corporate / startup chaos / creative+flexible / I'm open)
- [ ] Section 1 (Role Intent): 4 options (internship / full-time / freelance / exploring)
- [ ] Section 2 (Skill Identity): 6 options (code / design / sell / analyze / manage / figuring it out)
- [ ] Section 3 (Job Preferences): 4 options (remote / in-office / hybrid / doesn't matter)
- [ ] Section 4 (Strengths): Multi-select, pick exactly 2 from 6 options
- [ ] Section 5 (Dealbreakers): Multi-select from 5 options
- [ ] Section 6 (Availability): 4 options (immediately / 1 month / 3 months / browsing)
- [ ] All answers are persisted to the `candidate_profiles` table in Supabase
- [ ] Progress is saved — if user drops off, they resume where they left off on next login
- [ ] Incomplete onboarding shows "Finish Your Vibe Check" prompt on every login
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-004: Tier-1 College Gate (Section 7)
**Description:** As the platform, I need to block Tier-1 college students so that the platform remains exclusively for Tier-2/3 freshers.

**Acceptance Criteria:**
- [ ] After Section 6, AI asks "which college are you from?"
- [ ] Searchable dropdown populated from a `colleges` table with a `tier` column (1, 2, or 3)
- [ ] Master list includes all IITs, NITs, IIITs, BITS, IISc, and specified elite institutions as Tier-1
- [ ] If user selects a Tier-1 college: chat stops, polite "Fairness Screen" is displayed
- [ ] Block message: "Hey — this platform is only for Tier-2/Tier-3 freshers, so we can keep opportunities fair. You're already a rockstar, and we know you'll find something great elsewhere!"
- [ ] Account is flagged as `ineligible` in the database
- [ ] Ineligible users cannot access the dashboard or job feed
- [ ] If user selects Tier-2 or Tier-3 college: proceed to Section 8 (uploads)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-005: Candidate Resume Upload & Portfolio (Section 8)
**Description:** As a candidate, I want to upload my resume and optionally add portfolio links so employers can evaluate me.

**Acceptance Criteria:**
- [ ] After passing the college gate, a resume upload screen appears
- [ ] Resume upload is mandatory — PDF only, max 5MB
- [ ] File is stored in Supabase Storage bucket (`resumes/`)
- [ ] Optional fields: GitHub URL, LinkedIn URL, Portfolio URL
- [ ] Optional: Add project descriptions (title + short description, up to 3)
- [ ] All data saved to `candidate_profiles` table
- [ ] On completion, AI says "I'm ready! Let's find your match" and redirects to Job Feed
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-006: Employer AI Onboarding Chat
**Description:** As an employer, I want to complete a conversational AI questionnaire so the platform understands what kind of fresher I'm looking for.

**Acceptance Criteria:**
- [ ] Full-screen chat interface after OTP verification (same component as candidate, different flow)
- [ ] LLM generates warm, casual messages following the employer question bank (Sections 0-8)
- [ ] Section 0 (Warm-up): Fresher type — 5 options (hungry learner / job-ready / creative builder / dependable executor / just someone solid)
- [ ] Section 1 (Hiring Intent): 5 options (internship / full-time / freelance / bulk / exploring)
- [ ] Section 2 (Company Context): 5 options (early-stage startup / growing business / corporate / agency / non-profit)
- [ ] Section 3 (Role Category): 8 options (tech / marketing / sales / design / data / operations / product / other)
- [ ] Section 4 (Skills): Multi-select top 3 from predefined skill list + "Other" free text
- [ ] Section 5 (Philosophy): 5 options (skills>college / attitude>exp / communication / speed / loyalty)
- [ ] Section 6 (Candidate Type): 5 options (needs mentorship / independent / fast learner / structured / creative)
- [ ] Section 7 (Work Style): Work mode (remote/in-office/hybrid/flexible) + City dropdown
- [ ] Section 8 (Compensation): Pay type (stipend / CTC / freelance payout / performance+base). Enforces "unpaid not allowed" message.
- [ ] All answers persisted to `employer_profiles` table
- [ ] On completion, redirect to Employer Dashboard
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-007: Employer Company Profile Setup
**Description:** As an employer, I want to set up my company profile so candidates can learn about my company.

**Acceptance Criteria:**
- [ ] After AI onboarding, employer fills in: Company Name, Logo (image upload), Industry, "Company Vibe" description (free text)
- [ ] Logo stored in Supabase Storage (`logos/`)
- [ ] Data saved to `companies` table, linked to the employer user
- [ ] Profile is displayed on job cards and job detail pages
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-008: Job Posting Creation
**Description:** As an employer, I want to create a job/internship listing so candidates can discover and apply to it.

**Acceptance Criteria:**
- [ ] Job posting form with fields: Title, Description (rich text), Role Type (internship/full-time/freelance), Compensation (number + currency ₹), Location, Application Deadline
- [ ] Must select at least 1 skill tag from the predefined list
- [ ] If compensation is 0 or "Unpaid": Publish button is disabled and shows tooltip "Why we don't allow unpaid roles"
- [ ] Job is saved to `jobs` table with status `active`
- [ ] System prevents posting duplicate job title within 24 hours (same employer)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-009: Job Discovery Feed (Candidate)
**Description:** As a candidate, I want to browse available jobs in a feed so I can find roles that match my interests.

**Acceptance Criteria:**
- [ ] Job feed page shows cards with: Role Title, Company Name, Company Logo, Stipend/Salary, Role Type, Location
- [ ] Jobs are listed in reverse chronological order (newest first)
- [ ] Cards are filterable by: Role Type, Work Style (remote/office/hybrid), Skill Tags
- [ ] Clicking a card opens a job detail page with full description
- [ ] Feed only shows `active` jobs where deadline has not passed
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-010: Quick Apply
**Description:** As a candidate, I want to apply to a job with one tap so that applying is frictionless.

**Acceptance Criteria:**
- [ ] "Quick Apply" button on each job card and job detail page
- [ ] If candidate has a resume on file: application is submitted immediately (one tap)
- [ ] If no resume on file: a file upload modal appears instead of submitting
- [ ] Application creates a record in `applications` table with status `applied`
- [ ] Candidate cannot apply to the same job twice (button shows "Applied")
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-011: Employer Application Inbox
**Description:** As an employer, I want to see all candidates who applied to my jobs so I can review and shortlist them.

**Acceptance Criteria:**
- [ ] Dashboard page listing all applications grouped by job posting
- [ ] Each applicant row shows: Name, College, Key Skills (from onboarding), Application Date
- [ ] One-click "View Resume" opens the candidate's PDF in a new tab / modal
- [ ] One-click "Open Chat" initiates a direct chat with the candidate
- [ ] Applications are sorted by most recent first
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-012: Direct Chat (Recruiter-Initiated)
**Description:** As an employer, I want to chat directly with candidates so I can evaluate them and coordinate interviews.

**Acceptance Criteria:**
- [ ] Chat is recruiter-initiated only (candidates cannot message first to prevent spam)
- [ ] Real-time messaging using Supabase Realtime (subscriptions on `messages` table)
- [ ] Both parties see typing indicators and read receipts
- [ ] Messages persist and are viewable on subsequent logins
- [ ] Real-time notifications (in-app badge/toast) for new messages
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-013: Hiring Pipeline Status
**Description:** As an employer, I want to move candidates through a hiring pipeline so I can track progress.

**Acceptance Criteria:**
- [ ] Pipeline stages: Applied -> Shortlisted -> Interview -> Offer -> Hired
- [ ] Employer can change an applicant's stage from the inbox or chat view
- [ ] Stage changes are reflected in real-time for both employer and candidate
- [ ] Candidate dashboard shows current status for each application
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-014: Hire Completion & Celebration
**Description:** As an employer, I want to mark a candidate as hired so the job closes and everyone is notified.

**Acceptance Criteria:**
- [ ] "Mark as Hired" button in the pipeline when candidate is at "Offer" stage
- [ ] On click: job post status changes to `filled`
- [ ] Automated "Position Filled" email sent to all other applicants for that job
- [ ] Candidate sees a confirmation prompt to accept the hire
- [ ] Confetti animation plays on both employer and candidate screens upon confirmation
- [ ] Optional: 30-second "Vibe Feedback" form for the recruiter (1-5 star + short text)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

### US-015: College Master List Database
**Description:** As a developer, I need to seed the database with a categorized college list so the Tier-1 gate works.

**Acceptance Criteria:**
- [ ] `colleges` table with columns: `id`, `name`, `tier` (1, 2, or 3), `state`, `type` (IIT/NIT/IIIT/Private/State)
- [ ] Seed script populates all IITs (23), NITs (31), IIITs (26), BITS campuses, IISc, and other elite institutions as Tier-1
- [ ] At least 500 Tier-2 and Tier-3 colleges seeded for the searchable dropdown
- [ ] College search is fast (indexed `name` column, partial text match)
- [ ] Typecheck/lint passes

---

### US-016: Landing Page
**Description:** As a visitor, I want to see a landing page that explains the platform so I can decide whether to sign up as a candidate or employer.

**Acceptance Criteria:**
- [ ] Hero section with tagline explaining the platform mission
- [ ] Two clear CTAs: "Get Started as Student" and "Hire Freshers"
- [ ] Brief section explaining the 3 key value props (Tier-2/3 only, no unpaid roles, AI vibe matching)
- [ ] Mobile responsive
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

---

## Functional Requirements

- FR-1: The system must authenticate users via email + password with OTP verification (Supabase Auth)
- FR-2: The system must support two user roles: `candidate` and `employer`
- FR-3: The system must present an LLM-powered conversational AI chat as the first step after signup for both roles
- FR-4: The candidate AI chat must follow Sections 0-9 of the Candidate Questionnaire Bank, presenting tap-able pill options
- FR-5: The employer AI chat must follow Sections 0-8 of the Employer Questionnaire Bank, presenting tap-able pill options
- FR-6: The system must store all onboarding answers in structured profile tables (`candidate_profiles`, `employer_profiles`)
- FR-7: The system must maintain a `colleges` table with tier classification and block Tier-1 candidates with a polite fairness screen
- FR-8: Blocked candidates must have their account flagged as `ineligible` with no access to the dashboard or job feed
- FR-9: The system must require a mandatory PDF resume upload before any job application
- FR-10: The system must reject job postings with zero or unpaid compensation
- FR-11: The system must prevent duplicate job postings (same title by same employer within 24 hours)
- FR-12: The job feed must display active, non-expired jobs in reverse chronological order with filtering by role type, work style, and skill tags
- FR-13: Quick Apply must submit in one tap if resume exists, or prompt for upload if not
- FR-14: Chat must be recruiter-initiated and use Supabase Realtime for real-time messaging
- FR-15: The hiring pipeline must support stages: Applied -> Shortlisted -> Interview -> Offer -> Hired
- FR-16: Marking a candidate as Hired must close the job post and notify other applicants
- FR-17: Incomplete onboarding must prompt the user to finish on every subsequent login

---

## Non-Goals (Out of Scope for MVP)

- No AI/ML-based match scoring (deferred to post-MVP; MVP shows all relevant jobs)
- No payment processing or escrow system
- No video interview integration
- No mobile app (responsive web only)
- No admin panel for content moderation
- No candidate-to-candidate networking or community features
- No automatic priority/notification for Tier-1 blocked users to appeal
- No multi-language support
- No analytics dashboard for employers
- No bulk resume download for employers
- No SSO or social login (email + password only for MVP)

---

## Design Considerations

- **Chat UI:** Full-screen conversational interface. Messages appear one at a time with typing animation. Pill/bubble buttons for answer options. Smooth scroll to latest message.
- **Job Cards:** Clean card layout with company logo, role title, compensation badge, and location. Inspired by modern job boards (Wellfound/AngelList style).
- **Color System:** Warm, approachable palette. Avoid corporate blue. Consider gradients for the "Vibe Check" chat.
- **Mobile-First:** All screens must be responsive. Chat UI especially must work well on mobile.
- **Confetti:** Use a lightweight library (e.g., `canvas-confetti`) for the hire celebration.

---

## Technical Considerations

### Stack
- **Frontend:** Next.js 14+ (App Router) deployed on Vercel
- **Backend:** Supabase (PostgreSQL DB, Auth, Realtime, Storage, Edge Functions)
- **AI:** Claude API or OpenAI API for LLM-powered onboarding chat
- **Styling:** Tailwind CSS

### Database Schema (Key Tables)
- `users` — managed by Supabase Auth (extended with `role` and `onboarding_status`)
- `candidate_profiles` — all onboarding answers, resume URL, portfolio links, college FK, eligibility status
- `employer_profiles` — all onboarding answers, company FK
- `companies` — name, logo URL, industry, vibe description
- `colleges` — name, tier, state, type (seeded)
- `jobs` — title, description, role type, compensation, location, deadline, skill tags, status (active/filled/expired), employer FK
- `applications` — candidate FK, job FK, status (applied/shortlisted/interview/offer/hired/rejected), timestamps
- `messages` — sender FK, receiver FK, application FK, content, read status, timestamps
- `skills` — predefined skill tag list

### Key Integrations
- **Supabase Auth:** Email/password + OTP
- **Supabase Storage:** Resume PDFs + Company logos
- **Supabase Realtime:** Chat messages + notification badges
- **LLM API:** Conversational onboarding with structured output parsing

### Performance
- College search dropdown must be debounced and queried server-side (not loaded all at once)
- Job feed must be paginated (20 jobs per page)
- Chat messages loaded with cursor-based pagination (latest 50 first)

---

## Success Metrics

- Candidates complete full AI onboarding in under 5 minutes
- 80%+ of candidates who start onboarding finish it
- Employers can post their first job within 10 minutes of signup
- Average time from application to first recruiter message is under 48 hours
- Zero Tier-1 college candidates slip through the gate
- Zero unpaid job postings go live

---

## Open Questions

- Should there be a manual review/appeal process for edge-case colleges that are hard to classify?
- What LLM provider and model should be used for onboarding chat (Claude vs GPT)? What's the budget per conversation?
- Should the platform send email notifications for chat messages or only in-app?
- How should expired job postings be handled — auto-archive or prompt employer to renew?
- Should candidates be able to update their onboarding answers later, or is it a one-time flow?
