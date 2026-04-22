ALTER TABLE users
  ADD COLUMN IF NOT EXISTS recovery_email text,
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS official_title text,
  ADD COLUMN IF NOT EXISTS city text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_recovery_email_format_chk'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_recovery_email_format_chk
    CHECK (
      recovery_email IS NULL
      OR recovery_email ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
    );
  END IF;
END $$;

INSERT INTO users (
  id,
  email,
  phone,
  password_hash,
  full_name,
  role,
  zone_id,
  recovery_email,
  must_change_password,
  is_active,
  two_factor_enabled
)
VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccc01',
  'teklemintesnot2@gmail.com',
  '+251911100099',
  crypt('Mintesnot@1234&', gen_salt('bf', 10)),
  'Mintesnot Erstu',
  'zonal_admin',
  '11111111-1111-1111-1111-111111111101',
  'naife714@gmail.com',
  false,
  true,
  false
)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = crypt('Mintesnot@1234&', gen_salt('bf', 10)),
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  zone_id = EXCLUDED.zone_id,
  recovery_email = EXCLUDED.recovery_email,
  must_change_password = false,
  is_active = true;

UPDATE zones
SET zonal_admin_id = (
  SELECT id FROM users WHERE email = 'teklemintesnot2@gmail.com' LIMIT 1
)
WHERE id = '11111111-1111-1111-1111-111111111101';
