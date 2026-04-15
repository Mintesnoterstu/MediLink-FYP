-- MediLink core schema (PostgreSQL 14+ recommended)
-- Application sets per-request session vars for RLS: medilink.user_id, medilink.role

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'zonal_admin',
    'woreda_admin',
    'city_admin',
    'facility_admin',
    'doctor',
    'nurse',
    'patient'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_status AS ENUM ('pending', 'active', 'revoked', 'expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE consent_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_am text NOT NULL,
  region text,
  region_am text,
  population integer,
  zonal_admin_id uuid
);

CREATE TABLE IF NOT EXISTS woredas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_am text NOT NULL,
  zone_id uuid NOT NULL REFERENCES zones (id) ON DELETE CASCADE,
  population integer,
  woreda_admin_id uuid
);

CREATE TABLE IF NOT EXISTS facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_am text NOT NULL,
  type text NOT NULL,
  type_am text NOT NULL,
  license_number text,
  woreda_id uuid NOT NULL REFERENCES woredas (id) ON DELETE CASCADE,
  facility_admin_id uuid,
  contact_phone text,
  contact_email text,
  address text
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  phone text UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  full_name_am text,
  role user_role NOT NULL,
  professional_type text,
  license_number text,
  specialization text,
  department text,
  facility_id uuid REFERENCES facilities (id),
  woreda_id uuid REFERENCES woredas (id),
  zone_id uuid REFERENCES zones (id),
  created_by uuid REFERENCES users (id),
  is_active boolean NOT NULL DEFAULT true,
  last_login timestamptz,
  two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE zones
  ADD CONSTRAINT fk_zones_zonal_admin FOREIGN KEY (zonal_admin_id) REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE woredas
  ADD CONSTRAINT fk_woredas_woreda_admin FOREIGN KEY (woreda_admin_id) REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE facilities
  ADD CONSTRAINT fk_facilities_facility_admin FOREIGN KEY (facility_admin_id) REFERENCES users (id) DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  ethiopian_health_id text NOT NULL UNIQUE,
  date_of_birth date,
  gender text,
  blood_type text,
  encrypted_data text NOT NULL DEFAULT '',
  kebele_id text,
  region text,
  zone text,
  woreda text,
  kebele text,
  registered_by uuid REFERENCES users (id),
  facility_id uuid REFERENCES facilities (id),
  is_emergency_flag boolean NOT NULL DEFAULT false,
  emergency_flag_expires timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  record_type text NOT NULL,
  encrypted_data text NOT NULL DEFAULT '',
  created_by uuid NOT NULL REFERENCES users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid REFERENCES users (id),
  verified_at timestamptz,
  facility_id uuid REFERENCES facilities (id)
);

CREATE TABLE IF NOT EXISTS consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status consent_status NOT NULL DEFAULT 'pending',
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  granted_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  auto_revoked boolean NOT NULL DEFAULT false,
  regrant_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (patient_id, doctor_id)
);

CREATE TABLE IF NOT EXISTS consent_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status consent_request_status NOT NULL DEFAULT 'pending',
  requested_at timestamptz NOT NULL DEFAULT now(),
  reason text,
  responded_at timestamptz
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  facility_id uuid REFERENCES facilities (id),
  appointment_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  reason text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  name_am text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  description_am text NOT NULL,
  symptoms text[] NOT NULL DEFAULT ARRAY[]::text[],
  symptoms_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  causes text[] NOT NULL DEFAULT ARRAY[]::text[],
  causes_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  prevention text[] NOT NULL DEFAULT ARRAY[]::text[],
  prevention_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  treatment text[] NOT NULL DEFAULT ARRAY[]::text[],
  treatment_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  severity text,
  body_regions text[] NOT NULL DEFAULT ARRAY[]::text[],
  seasonal text[] NOT NULL DEFAULT ARRAY[]::text[],
  seasonal_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  prevalence jsonb
);

CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  name_am text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  description_am text NOT NULL,
  uses text[] NOT NULL DEFAULT ARRAY[]::text[],
  uses_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  dosage text,
  dosage_am text,
  side_effects text[] NOT NULL DEFAULT ARRAY[]::text[],
  contraindications text[] NOT NULL DEFAULT ARRAY[]::text[],
  safety_warnings text[] NOT NULL DEFAULT ARRAY[]::text[],
  requires_prescription boolean NOT NULL DEFAULT false,
  ministry_approved boolean NOT NULL DEFAULT false,
  scientific_evidence text,
  preparation text,
  preparation_am text,
  indications text[] NOT NULL DEFAULT ARRAY[]::text[],
  indications_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  contraindications_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  safety_warnings_am text[] NOT NULL DEFAULT ARRAY[]::text[],
  medication_interactions text[] NOT NULL DEFAULT ARRAY[]::text[],
  cultural_context text,
  cultural_context_am text
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ts timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES users (id),
  actor_role user_role,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  patient_id uuid REFERENCES patients (id),
  consent_id uuid REFERENCES consents (id),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  previous_hash text,
  current_hash text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_facility ON users (facility_id);
CREATE INDEX IF NOT EXISTS idx_patients_health_id ON patients (ethiopian_health_id);
CREATE INDEX IF NOT EXISTS idx_patients_user ON patients (user_id);
CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents (patient_id);
CREATE INDEX IF NOT EXISTS idx_consents_doctor ON consents (doctor_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents (status);
CREATE INDEX IF NOT EXISTS idx_health_records_patient ON health_records (patient_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records (record_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments (patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (appointment_date);
CREATE INDEX IF NOT EXISTS idx_audit_patient ON audit_logs (patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_ts ON audit_logs (ts);
CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases (name);
CREATE INDEX IF NOT EXISTS idx_diseases_name_am ON diseases (name_am);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines (name);
CREATE INDEX IF NOT EXISTS idx_medicines_name_am ON medicines (name_am);

COMMENT ON COLUMN patients.encrypted_data IS 'App-layer AES-256-GCM ciphertext (base64 JSON payload); see database/node/src/encryption.js';
COMMENT ON COLUMN health_records.encrypted_data IS 'App-layer AES-256-GCM ciphertext (base64 JSON payload)';
