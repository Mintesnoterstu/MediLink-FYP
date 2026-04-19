-- Real clinical users and patients from project brief.
-- Default password for all users seeded here: password
-- bcrypt hash for "password":
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Ensure named facilities exist
INSERT INTO facilities (id, name, name_am, type, type_am, license_number, woreda_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
  'Jimma Hospital',
  'ጅማ ሆስፒታል',
  'Hospital',
  'ሆስፒታል',
  'JZ-JIMMA-HOSP',
  '22222222-2222-2222-2222-222222222201'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Jimma Hospital');

INSERT INTO facilities (id, name, name_am, type, type_am, license_number, woreda_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
  'Jimma Health Center',
  'ጅማ ጤና ጣቢያ',
  'Health Center',
  'ጤና ጣቢያ',
  'JZ-JIMMA-HC',
  '22222222-2222-2222-2222-222222222201'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Jimma Health Center');

INSERT INTO facilities (id, name, name_am, type, type_am, license_number, woreda_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
  'Seka Health Center',
  'ሴካ ጤና ጣቢያ',
  'Health Center',
  'ጤና ጣቢያ',
  'JZ-SEKA-HC',
  '22222222-2222-2222-2222-222222222202'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Seka Health Center');

INSERT INTO facilities (id, name, name_am, type, type_am, license_number, woreda_id)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb04',
  'Gera Clinic',
  'ገራ ክሊኒክ',
  'Clinic',
  'ክሊኒክ',
  'JZ-GERA-CLINIC',
  '22222222-2222-2222-2222-222222222203'
WHERE NOT EXISTS (SELECT 1 FROM facilities WHERE name = 'Gera Clinic');

-- Facility admin from brief
INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am, role, facility_id, zone_id, woreda_id, is_active, two_factor_enabled
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10',
    'hawa.a@sekahc.gov.et',
    '+251911100010',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Hawa Ahmed',
    'ሐዋ አህመድ',
    'facility_admin',
    (SELECT id FROM facilities WHERE name = 'Seka Health Center' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222202',
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Doctors and nurse from brief
INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am, role, professional_type, specialization, facility_id, zone_id, woreda_id, is_active, two_factor_enabled
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    'tadesse.b@jimmahosp.gov.et',
    '+251911100011',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Dr. Tadesse Bekele',
    'ዶ/ር ታደሰ በቀለ',
    'doctor',
    'doctor',
    'General Practitioner',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    true,
    false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12',
    'abebech.m@jimmahosp.gov.et',
    '+251911100012',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Dr. Abebech Mohammed',
    'ዶ/ር አበበች መሐመድ',
    'doctor',
    'doctor',
    'Pediatrician',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    true,
    false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb13',
    'alemit.h@jimmahosp.gov.et',
    '+251911100013',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Alemitu Hailu',
    'አለሚቱ ሀይሉ',
    'nurse',
    'nurse',
    NULL,
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

-- Patients from brief
INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am, role, facility_id, zone_id, woreda_id, is_active, two_factor_enabled
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14',
    'almaz.k@medilink.patient',
    '+251911100014',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Almaz Kebede',
    'አልማዝ ከበደ',
    'patient',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    true,
    false
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15',
    'tekle.h@medilink.patient',
    '+251911100015',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Tekle Hailu',
    'ተክለ ሀይሉ',
    'patient',
    (SELECT id FROM facilities WHERE name = 'Seka Health Center' LIMIT 1),
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222202',
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO patients (
  id, user_id, ethiopian_health_id, date_of_birth, gender, blood_type, encrypted_data, facility_id, registered_by
)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb14',
    'ETH-2026-0315-AB123',
    '1995-04-10',
    'female',
    'O+',
    '',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb22',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb15',
    'ETH-2026-0315-CD456',
    '1992-09-21',
    'male',
    'A+',
    '',
    (SELECT id FROM facilities WHERE name = 'Seka Health Center' LIMIT 1),
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb10'
  )
ON CONFLICT (id) DO NOTHING;

-- Consent examples from brief
INSERT INTO consents (patient_id, doctor_id, status, scope, granted_at, expires_at, auto_revoked)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    'active',
    '{"records": true, "appointments": true, "history": true}'::jsonb,
    now() - interval '2 days',
    '2026-04-16T23:59:59Z',
    false
  )
ON CONFLICT (patient_id, doctor_id) DO UPDATE
SET status = EXCLUDED.status, scope = EXCLUDED.scope, granted_at = EXCLUDED.granted_at, expires_at = EXCLUDED.expires_at, auto_revoked = EXCLUDED.auto_revoked;

INSERT INTO consent_requests (patient_id, doctor_id, status, requested_at, reason)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb12',
    'pending',
    now() - interval '1 day',
    'Pediatric follow-up review'
  );

-- Health records from brief
INSERT INTO health_records (patient_id, record_type, encrypted_data, created_by, record_date, facility_id)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'diagnosis',
    '',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    '2026-03-10',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1)
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'screening',
    '',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    '2026-02-15',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1)
  );

-- Appointments from brief
INSERT INTO appointments (patient_id, doctor_id, facility_id, appointment_date, status, reason)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '2026-04-20T10:00:00Z',
    'scheduled',
    'Upcoming follow-up visit'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb21',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb11',
    (SELECT id FROM facilities WHERE name = 'Jimma Hospital' LIMIT 1),
    '2026-03-10T09:30:00Z',
    'completed',
    'Past appointment'
  );
