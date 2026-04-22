ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS license_document text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_facilities_woreda_id ON facilities (woreda_id);
CREATE INDEX IF NOT EXISTS idx_facilities_city ON facilities (city);
CREATE INDEX IF NOT EXISTS idx_facilities_created_by ON facilities (created_by);
