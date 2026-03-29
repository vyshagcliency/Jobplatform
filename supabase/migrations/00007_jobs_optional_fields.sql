-- Make role_type, compensation, and work_style optional on jobs table
-- (location is already nullable)

ALTER TABLE jobs ALTER COLUMN role_type DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN compensation DROP NOT NULL;
ALTER TABLE jobs ALTER COLUMN work_style DROP NOT NULL;
