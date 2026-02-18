-- Hire feedback table
CREATE TABLE hire_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT CHECK (char_length(comment) <= 280),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE hire_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can insert feedback"
  ON hire_feedback FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE a.id = hire_feedback.application_id
      AND j.employer_id = auth.uid()
    )
  );

CREATE POLICY "Feedback is readable by involved parties"
  ON hire_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN jobs j ON j.id = a.job_id
      WHERE a.id = hire_feedback.application_id
      AND (j.employer_id = auth.uid() OR a.candidate_id = auth.uid())
    )
  );
