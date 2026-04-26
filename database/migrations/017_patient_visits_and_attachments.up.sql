CREATE TABLE IF NOT EXISTS patient_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  visit_date timestamptz NOT NULL DEFAULT now(),
  subjective jsonb NOT NULL DEFAULT '{}'::jsonb,
  objective jsonb NOT NULL DEFAULT '{}'::jsonb,
  assessment jsonb NOT NULL DEFAULT '{}'::jsonb,
  plan jsonb NOT NULL DEFAULT '{}'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_visits_patient ON patient_visits (patient_id, visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_visits_doctor ON patient_visits (doctor_id, visit_date DESC);
