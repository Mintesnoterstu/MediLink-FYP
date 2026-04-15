-- Session GUCs (set per transaction from Node/pg):
--   SELECT set_config('medilink.user_id', '<uuid>', true);
--   SELECT set_config('medilink.role', 'patient|doctor|service_role|...', true);

CREATE SCHEMA IF NOT EXISTS medilink;

CREATE OR REPLACE FUNCTION medilink.session_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN current_setting('medilink.user_id', true) IS NULL THEN NULL
    WHEN btrim(current_setting('medilink.user_id', true)) = '' THEN NULL
    ELSE btrim(current_setting('medilink.user_id', true))::uuid
  END;
$$;

CREATE OR REPLACE FUNCTION medilink.session_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN current_setting('medilink.role', true) IS NULL THEN NULL
    ELSE lower(btrim(current_setting('medilink.role', true)))
  END;
$$;

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients FORCE ROW LEVEL SECURITY;

CREATE POLICY patients_select ON patients
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'patient'
    AND user_id = medilink.session_user_id()
  )
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = patients.id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

CREATE POLICY patients_insert ON patients
FOR INSERT
WITH CHECK (medilink.session_role() = 'service_role');

CREATE POLICY patients_update_patient ON patients
FOR UPDATE
USING (
  medilink.session_role() = 'patient'
  AND user_id = medilink.session_user_id()
)
WITH CHECK (
  medilink.session_role() = 'patient'
  AND user_id = medilink.session_user_id()
);

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records FORCE ROW LEVEL SECURITY;

CREATE POLICY health_records_select ON health_records
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'patient'
    AND patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  )
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

CREATE POLICY health_records_insert ON health_records
FOR INSERT
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

CREATE POLICY health_records_update ON health_records
FOR UPDATE
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'doctor'
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents FORCE ROW LEVEL SECURITY;

CREATE POLICY consents_select ON consents
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
);

CREATE POLICY consents_insert ON consents
FOR INSERT
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
);

CREATE POLICY consents_update ON consents
FOR UPDATE
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
);

ALTER TABLE consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_requests FORCE ROW LEVEL SECURITY;

CREATE POLICY consent_requests_all ON consent_requests
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
)
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

CREATE POLICY appointments_select ON appointments
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
);

CREATE POLICY appointments_mutate ON appointments
FOR ALL
USING (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
)
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  OR doctor_id = medilink.session_user_id()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON audit_logs
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR (
    patient_id IS NOT NULL
    AND patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  )
);

CREATE POLICY audit_logs_insert ON audit_logs
FOR INSERT
WITH CHECK (medilink.session_role() = 'service_role');

-- Reference + directory data: readable by any authenticated app role (not anonymous)
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY diseases_read ON diseases FOR SELECT USING (true);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY medicines_read ON medicines FOR SELECT USING (true);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY zones_read ON zones FOR SELECT USING (true);

ALTER TABLE woredas ENABLE ROW LEVEL SECURITY;
CREATE POLICY woredas_read ON woredas FOR SELECT USING (true);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY facilities_read ON facilities FOR SELECT USING (true);

-- users: no RLS — email/password lookup and directory rules are enforced in the API layer
-- (RLS here breaks login queries before session GUCs exist).
