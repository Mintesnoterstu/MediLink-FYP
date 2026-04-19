-- Additional patient-tracking tables to match frontend service contracts.

CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  reminder_enabled boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid REFERENCES users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vital_signs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  blood_pressure text,
  heart_rate integer,
  temperature numeric(4,1),
  weight numeric(5,2),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS symptom_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  summary text NOT NULL,
  risk_level text,
  recommendations text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  priority text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications (patient_id);
CREATE INDEX IF NOT EXISTS idx_vital_signs_patient ON vital_signs (patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_analyses_patient ON symptom_analyses (patient_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_patient ON ai_recommendations (patient_id);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications FORCE ROW LEVEL SECURITY;

CREATE POLICY medications_select ON medications
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = medications.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
);

CREATE POLICY medications_mutate ON medications
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = medications.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
)
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = medications.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
);

ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vital_signs FORCE ROW LEVEL SECURITY;

CREATE POLICY vital_signs_all ON vital_signs
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = vital_signs.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
)
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = vital_signs.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
);

ALTER TABLE symptom_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_analyses FORCE ROW LEVEL SECURITY;

CREATE POLICY symptom_analyses_all ON symptom_analyses
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = symptom_analyses.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
)
WITH CHECK (medilink.session_role() IN ('service_role','doctor'));

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations FORCE ROW LEVEL SECURITY;

CREATE POLICY ai_recommendations_all ON ai_recommendations
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1 FROM consents c
      WHERE c.patient_id = ai_recommendations.patient_id
      AND c.doctor_id = medilink.session_user_id()
      AND c.status = 'active'
    )
  )
)
WITH CHECK (medilink.session_role() IN ('service_role','doctor'));
