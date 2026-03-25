-- Add external job fields to the jobs table
-- When external_url is set, the job is "external" (redirects to the original posting).
-- Otherwise it's a native platform job.

ALTER TABLE jobs
  ADD COLUMN external_url      TEXT,
  ADD COLUMN source            TEXT,
  ADD COLUMN source_company_name TEXT,
  ADD COLUMN source_logo_url   TEXT;
