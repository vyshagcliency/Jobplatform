-- Profiles table extending Supabase auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('candidate', 'employer')),
  onboarding_status TEXT NOT NULL DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'in_progress', 'completed')),
  eligibility TEXT NOT NULL DEFAULT 'eligible' CHECK (eligibility IN ('eligible', 'ineligible')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Colleges table
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier INT NOT NULL CHECK (tier IN (1, 2, 3)),
  state TEXT,
  type TEXT NOT NULL CHECK (type IN ('IIT', 'NIT', 'IIIT', 'BITS', 'IISc', 'Private', 'State', 'Deemed', 'Other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable pg_trgm extension for partial text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_colleges_name ON colleges USING gin (name gin_trgm_ops);

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT
);

-- Candidate profiles
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  work_vibe TEXT,
  role_intent TEXT,
  skill_identity TEXT,
  job_preference TEXT,
  strengths TEXT[],
  dealbreakers TEXT[],
  availability TEXT,
  college_id UUID REFERENCES colleges(id),
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  projects JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Employer profiles
CREATE TABLE employer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  fresher_type TEXT,
  hiring_intent TEXT,
  company_context TEXT,
  role_category TEXT,
  top_skills TEXT[],
  hiring_philosophy TEXT,
  candidate_type_pref TEXT,
  work_style TEXT,
  city TEXT,
  compensation_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own row
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Candidate profiles: users can read/update their own row
CREATE POLICY "Candidates can read own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Candidates can insert own profile"
  ON candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Employer profiles: users can read/update their own row
CREATE POLICY "Employers can read own profile"
  ON employer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can update own profile"
  ON employer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Employers can insert own profile"
  ON employer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Colleges: readable by all authenticated users
CREATE POLICY "Colleges are readable by authenticated users"
  ON colleges FOR SELECT
  USING (auth.role() = 'authenticated');

-- Skills: readable by all authenticated users
CREATE POLICY "Skills are readable by authenticated users"
  ON skills FOR SELECT
  USING (auth.role() = 'authenticated');
