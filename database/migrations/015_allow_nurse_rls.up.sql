-- Allow nurses to behave like doctors in RLS policies.

-- patients_select: include nurse
DROP POLICY IF EXISTS patients_select ON patients;
CREATE POLICY patients_select ON patients
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'patient'
    AND user_id = medilink.session_user_id()
  )
  OR (
    medilink.session_role() IN ('doctor','nurse')
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = patients.id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

-- health_records: include nurse
DROP POLICY IF EXISTS health_records_select ON health_records;
CREATE POLICY health_records_select ON health_records
FOR SELECT
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() = 'patient'
    AND patient_id IN (SELECT id FROM patients WHERE user_id = medilink.session_user_id())
  )
  OR (
    medilink.session_role() IN ('doctor','nurse')
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS health_records_insert ON health_records;
CREATE POLICY health_records_insert ON health_records
FOR INSERT
WITH CHECK (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() IN ('doctor','nurse')
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

DROP POLICY IF EXISTS health_records_update ON health_records;
CREATE POLICY health_records_update ON health_records
FOR UPDATE
USING (
  medilink.session_role() = 'service_role'
  OR (
    medilink.session_role() IN ('doctor','nurse')
    AND EXISTS (
      SELECT 1
      FROM consents c
      WHERE c.patient_id = health_records.patient_id
        AND c.doctor_id = medilink.session_user_id()
        AND c.status = 'active'
    )
  )
);

-- consent_requests: include nurse already (doctor_id match); no change required.

