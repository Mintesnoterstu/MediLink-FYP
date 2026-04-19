-- Real admin accounts for FYP demo (Jimma hierarchy).
-- Default password for all seeded users below: password
-- bcrypt hash for "password":
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO users (
  id, email, phone, password_hash, full_name, full_name_am,
  role, zone_id, woreda_id, facility_id, is_active, two_factor_enabled
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'abdi.m@jimmazone.gov.et',
    '+251911100001',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Abdi Mohammed',
    'አብዲ መሐመድ',
    'zonal_admin',
    '11111111-1111-1111-1111-111111111101',
    NULL,
    NULL,
    true,
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'sara.m@jimmaworeda.gov.et',
    '+251911100002',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Sara Mohammed',
    'ሳራ መሐመድ',
    'woreda_admin',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    NULL,
    true,
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'hiwot.a@jimmacity.gov.et',
    '+251911100003',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Hiwot Ayele',
    'ሕይወት አየለ',
    'city_admin',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    NULL,
    true,
    false
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'tesfaye.a@jimmahosp.gov.et',
    '+251911100004',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Dr. Tesfaye Ayele',
    'ዶ/ር ተስፋዬ አየለ',
    'facility_admin',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    (SELECT id FROM facilities WHERE license_number = 'JZ-FAC-0001' LIMIT 1),
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;

UPDATE zones
SET zonal_admin_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'
WHERE id = '11111111-1111-1111-1111-111111111101';

UPDATE woredas
SET woreda_admin_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'
WHERE id = '22222222-2222-2222-2222-222222222201';

UPDATE facilities
SET facility_admin_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4'
WHERE license_number = 'JZ-FAC-0001';
