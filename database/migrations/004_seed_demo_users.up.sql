-- Demo users, patients, consents, records (run once; bcrypt password = "password")
-- Requires 003_seed_geography applied.

INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am, role, facility_id, is_active
)
SELECT
  v.id,
  v.email,
  v.phone,
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  v.full_name,
  v.full_name_am,
  v.role::user_role,
  f.id,
  true
FROM (VALUES
  ('33333333-3333-3333-3333-333333333301'::uuid, 'zonal.admin@medilink.demo', '+251911000001', 'Zonal Admin Demo', 'የዞን አስተዳዳሪ', 'zonal_admin'),
  ('33333333-3333-3333-3333-333333333302'::uuid, 'woreda.admin@medilink.demo', '+251911000002', 'Woreda Admin Demo', 'የወረዳ አስተዳዳሪ', 'woreda_admin'),
  ('33333333-3333-3333-3333-333333333303'::uuid, 'facility.admin@medilink.demo', '+251911000003', 'Facility Admin Demo', 'የመስተንግስት አስተዳዳሪ', 'facility_admin'),
  ('33333333-3333-3333-3333-333333333304'::uuid, 'doctor1@medilink.demo', '+251911000004', 'Dr. Abebe Kebede', 'ዶ/ር አበበ ከበደ', 'doctor'),
  ('33333333-3333-3333-3333-333333333305'::uuid, 'doctor2@medilink.demo', '+251911000005', 'Dr. Almaz Tesfaye', 'ዶ/ር አልማዝ ተስፋዬ', 'doctor')
) AS v(id, email, phone, full_name, full_name_am, role)
CROSS JOIN (SELECT id FROM facilities ORDER BY license_number LIMIT 1) AS f
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am, role, facility_id, is_active
)
VALUES
  (
    '33333333-3333-3333-3333-333333333306',
    'patient1@medilink.demo',
    '+251911000006',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Patient One Demo',
    'ታካሚ አንድ',
    'patient',
    NULL,
    true
  ),
  (
    '33333333-3333-3333-3333-333333333307',
    'patient2@medilink.demo',
    '+251911000007',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Patient Two Demo',
    'ታካሚ ሁለት',
    'patient',
    NULL,
    true
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (
  id, user_id, ethiopian_health_id, date_of_birth, gender, blood_type,
  encrypted_data, facility_id, registered_by
)
VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333306',
    'EHID-JZ-0000000001',
    '1992-05-15',
    'female',
    'O+',
    '',
    (SELECT id FROM facilities ORDER BY license_number LIMIT 1),
    '33333333-3333-3333-3333-333333333303'
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '33333333-3333-3333-3333-333333333307',
    'EHID-JZ-0000000002',
    '1988-11-02',
    'male',
    'A+',
    '',
    (SELECT id FROM facilities ORDER BY license_number LIMIT 1),
    '33333333-3333-3333-3333-333333333303'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO consents (patient_id, doctor_id, status, scope, granted_at)
VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333304',
    'active',
    '{"records": true, "appointments": true}'::jsonb,
    now()
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '33333333-3333-3333-3333-333333333305',
    'active',
    '{"records": true}'::jsonb,
    now()
  )
ON CONFLICT (patient_id, doctor_id) DO NOTHING;

INSERT INTO health_records (patient_id, record_type, encrypted_data, created_by, record_date)
VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    'visit',
    '',
    '33333333-3333-3333-3333-333333333304',
    CURRENT_DATE
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    'lab',
    '',
    '33333333-3333-3333-3333-333333333305',
    CURRENT_DATE - 3
  );

INSERT INTO appointments (patient_id, doctor_id, facility_id, appointment_date, status, reason)
VALUES
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333304',
    (SELECT id FROM facilities ORDER BY license_number LIMIT 1),
    now() + interval '3 days',
    'scheduled',
    'Follow-up hypertension'
  );

INSERT INTO audit_logs (
  actor_id, actor_role, action, resource_type, resource_id, patient_id, details, previous_hash, current_hash
)
VALUES
  (
    '33333333-3333-3333-3333-333333333304',
    'doctor'::user_role,
    'view_patient',
    'patient',
    '44444444-4444-4444-4444-444444444401',
    '44444444-4444-4444-4444-444444444401',
    '{"path": "/api/patients/demo"}'::jsonb,
    NULL,
    encode(digest('genesis', 'sha256'), 'hex')
  );

UPDATE zones SET zonal_admin_id = '33333333-3333-3333-3333-333333333301'
WHERE id = '11111111-1111-1111-1111-111111111101';

UPDATE woredas SET woreda_admin_id = '33333333-3333-3333-3333-333333333302'
WHERE id = '22222222-2222-2222-2222-222222222201';

UPDATE facilities SET facility_admin_id = '33333333-3333-3333-3333-333333333303'
WHERE license_number = 'JZ-FAC-0001';
