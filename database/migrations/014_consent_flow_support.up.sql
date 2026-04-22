DO $$ BEGIN
  CREATE TYPE health_record_status AS ENUM ('pending', 'approved', 'disputed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS status health_record_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS disputed_at timestamptz,
  ADD COLUMN IF NOT EXISTS dispute_reason text;

CREATE INDEX IF NOT EXISTS idx_health_records_status ON health_records (status);
CREATE INDEX IF NOT EXISTS idx_consent_requests_status ON consent_requests (status);
