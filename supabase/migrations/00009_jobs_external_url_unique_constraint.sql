-- Replace the partial unique index on external_url with a full UNIQUE constraint.
-- ON CONFLICT (external_url) in upserts requires a real unique constraint, not a
-- partial index. Postgres UNIQUE allows multiple NULLs by default, so native
-- jobs (external_url IS NULL) are unaffected — only external jobs are deduped.

DROP INDEX IF EXISTS jobs_external_url_unique;

ALTER TABLE jobs ADD CONSTRAINT jobs_external_url_key UNIQUE (external_url);
