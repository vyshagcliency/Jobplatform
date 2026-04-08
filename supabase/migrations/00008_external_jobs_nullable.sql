-- Allow external jobs (external_url IS NOT NULL) to skip company_id, employer_id,
-- and description. Native jobs (external_url IS NULL) still require all three,
-- enforced by a CHECK constraint.

ALTER TABLE jobs ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN employer_id DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN description DROP NOT NULL;

ALTER TABLE jobs ADD CONSTRAINT jobs_native_requires_core_fields
  CHECK (
    external_url IS NOT NULL
    OR (company_id IS NOT NULL AND employer_id IS NOT NULL AND description IS NOT NULL)
  );

-- Prevent duplicate external-job imports on re-runs.
CREATE UNIQUE INDEX jobs_external_url_unique
  ON jobs (external_url)
  WHERE external_url IS NOT NULL;
