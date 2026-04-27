# MediLink — Demo Notes (Local Presentation)

This file is a **presentation-ready** guide to demo MediLink locally: what works, what each role can do, and the recommended click-by-click storyline.

---

## Quick local run (stable demo setup)

### 1) Database (Postgres) + migrations

- Ensure Postgres is running and your backend `.env` has a valid `DATABASE_URL`.
- Apply migrations + seeds:

```bash
cd MediLink-FYP/database/node
npm install
npm run migrate:up
```

### 2) Backend API

```bash
cd MediLink-FYP/backend/api
npm install
npm run start:clean
```

- API base: `http://localhost:3001/api`

### 3) Frontend

```bash
cd MediLink-FYP/frontend
npm install
npm run dev
```

- UI usually: `http://localhost:5173`

---

## Demo logins (seeded users)

All seeded demo accounts use the same default password:

- **Password**: `password`

### Admin demo users (simple demo seed)
From `database/migrations/004_seed_demo_users.up.sql`:

- **Zonal admin**: `zonal.admin@medilink.demo`
- **Woreda admin**: `woreda.admin@medilink.demo`
- **Facility admin**: `facility.admin@medilink.demo`
- **Doctor**: `doctor1@medilink.demo`
- **Doctor**: `doctor2@medilink.demo`
- **Patient**: `patient1@medilink.demo` (EHID: `EHID-JZ-0000000001`)
- **Patient**: `patient2@medilink.demo` (EHID: `EHID-JZ-0000000002`)

### “Real brief” accounts (more realistic names)
From `database/migrations/009_seed_real_admin_accounts.up.sql` and `010_seed_real_clinical_accounts.up.sql`:

- **Zonal admin**: `abdi.m@jimmazone.gov.et`
- **Woreda admin**: `sara.m@jimmaworeda.gov.et`
- **City admin**: `hiwot.a@jimmacity.gov.et`
- **Facility admin**: `tesfaye.a@jimmahosp.gov.et`
- **Facility admin**: `hawa.a@sekahc.gov.et`
- **Doctor**: `tadesse.b@jimmahosp.gov.et`
- **Doctor**: `abebech.m@jimmahosp.gov.et`
- **Nurse**: `alemit.h@jimmahosp.gov.et`
- **Patient**: `almaz.k@medilink.patient` (EHID: `ETH-2026-0315-AB123`)
- **Patient**: `tekle.h@medilink.patient` (EHID: `ETH-2026-0315-CD456`)

---

## What to say (30–45 seconds)

MediLink is a role-based medical information system designed for a zone/woreda/facility hierarchy.

- **Patients** own their data and can review records, appointments, and manage consent.
- **Health professionals** can only access patient data when consent exists (RLS enforced).
- **Admins** manage accounts and facilities, but cannot browse patient medical details (privacy-first).

---

## Recommended demo storyline (5–10 minutes)

### A) Zonal Admin (oversight dashboard + admin management)

Login: `abdi.m@jimmazone.gov.et` / `password`

Show:
- **Dashboard summary cards** (aggregated counts / anonymized view)
- **Create Admins**:
  - Create a woreda/city/facility admin (email delivery may show as unavailable locally; the account is still created and a temporary password is returned/visible in UI flows)
- **Admin lists**:
  - Use **Edit**, **Suspend/Activate**, and **Reset Password** on admin accounts (buttons are wired to backend endpoints)

Key message:
- Zonal admin can manage admins and view anonymous stats, but not view patient-level medical records.

### B) Facility Admin (patient registration + facility operations)

Login: `tesfaye.a@jimmahosp.gov.et` / `password`

Show:
- **Register New Patient**:
  - Create a new patient, capture Ethiopian Health ID (EHID)
- **Patients list**:
  - Newly registered patient appears in list (basic info)

Key message:
- Facility admin controls onboarding but does not “read clinical notes” like a doctor.

### C) Patient (records + health summary + consent control)

Login: `almaz.k@medilink.patient` / `password`

Show:
- **Health Summary**: dynamically loaded summary (profile, records count, consents, appointments)
- **My Records**: record details display in readable sections (no raw JSON dump)
- **My Doctors**:
  - Show active consents
  - **Revoke consent** (demonstrate patient control)
- **Consents / Pending Approvals**:
  - Approve a pending request (if one exists) so a clinician can access the patient

Key message:
- Patients are the consent authority; access is explicit and revocable.

### D) Doctor/Nurse (request consent + patient dashboard + records)

Login: `tadesse.b@jimmahosp.gov.et` / `password`

Show:
- **Request consent** using patient EHID (e.g., `ETH-2026-0315-AB123`)
- After patient approval:
  - **My Patients** shows the patient
  - Open **Patient Dashboard** and view records
  - Open a record and show the **structured “Record Detail”** view (SOAP-style sections and human-readable blocks)
- **Create/Update record** (if enabled in UI):
  - Demonstrate record creation is tied to the clinician identity

Key message:
- Clinicians can only see patients once consent is active (privacy + auditability).

---

## Key functionality checklist (what works)

- **Auth**
  - Email/phone + password login
  - Optional 2FA challenge flow (OTP over SMS if configured)
- **RBAC + privacy**
  - Roles: `patient`, `doctor`, `nurse`, `facility_admin`, `woreda_admin`, `city_admin`, `zonal_admin`
  - DB RLS session enforcement using `medilink.user_id` + `medilink.role`
- **Patient dashboard**
  - Health summary uses real backend APIs (not hardcoded)
  - My records show readable details (not raw JSON)
  - My doctors list comes from active consent data + revoke action
- **Professional dashboard**
  - My patients based on consents
  - Can cancel pending consent requests (where available)
  - Record create/update requests are implemented (where UI exposes it)
- **Admin dashboards**
  - Admin list actions: Edit, Suspend/Activate, Reset Password
  - Non-real/demo buttons show info instead of being dead clicks (print, verify phone, etc.)

---

## Email/SMTP note (local demo)

If the UI shows an email banner:
- It is **informational** (does not block login or core flows).
- Locally, if SMTP is unreachable, the system falls back to **logging email content** instead of failing the workflow.

---

## Troubleshooting (demo day)

- **Frontend loads but API calls fail**
  - Ensure API is running on `3001`
  - Ensure frontend `VITE_API_BASE_URL` points to `http://localhost:3001/api`
- **Login stuck on loading**
  - Open DevTools → Network, confirm `/api/auth/login` returns JSON
  - Confirm `JWT_SECRET` exists in backend `.env`
- **Migrations fail**
  - Re-run `npm run migrate:up` from `database/node`
  - Ensure Postgres user has permissions on the target DB

