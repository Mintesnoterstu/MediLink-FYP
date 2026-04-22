ALTER TABLE users
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS license_document text;

CREATE INDEX IF NOT EXISTS idx_users_role_facility ON users (role, facility_id);
