# MediLink Test Credentials

This project supports two login modes:

1. **Frontend mock mode** (no backend API configured)
2. **Real backend mode** (PostgreSQL + Express API)

---

## 1) Frontend Mock Mode Accounts

These work when `VITE_API_BASE_URL` is **not** set.

### Patient Account
- **Email:** `patient@medilink.test`
- **Password:** `patient123`
- **Role:** Patient

### Provider Account
- **Email:** `provider@medilink.test`
- **Password:** `provider123`
- **Role:** Healthcare Provider

### Zonal Admin Account
- **Email:** `admin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Zonal)

### Woreda Admin Account
- **Email:** `woredaadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Woreda)

### City Admin Account
- **Email:** `cityadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (City)

### Facility Admin Account
- **Email:** `facilityadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Facility)

---

## 2) Real Backend Seed Accounts

These work when frontend points to the backend API (for example `VITE_API_BASE_URL=http://localhost:3001/api`) and database seeds are applied.

> Default seeded password for these users: `password`

### Admin Accounts
- **Zonal Admin**: `zonal.admin@medilink.demo`
- **Woreda Admin**: `woreda.admin@medilink.demo`
- **Facility Admin**: `facility.admin@medilink.demo`
- **City Admin**: `hiwot.a@jimmacity.gov.et`

### Real Government/Facility Admin Accounts (FYP)
- **Zonal Admin**: `abdi.m@jimmazone.gov.et` / `password`
- **Woreda Admin (Jimma)**: `sara.m@jimmaworeda.gov.et` / `password`
- **City Admin (Jimma City)**: `hiwot.a@jimmacity.gov.et` / `password`
- **Facility Admin (Jimma Hospital)**: `tesfaye.a@jimmahosp.gov.et` / `password`
- **Facility Admin (Seka Health Center)**: `hawa.a@sekahc.gov.et` / `password`

### Professional Accounts
- **Doctor**: `doctor1@medilink.demo` / `password`
- **Doctor**: `doctor2@medilink.demo` / `password`
- **Dr. Tadesse Bekele**: `tadesse.b@jimmahosp.gov.et` / `password`
- **Dr. Abebech Mohammed**: `abebech.m@jimmahosp.gov.et` / `password`
- **Nurse Alemitu Hailu**: `alemit.h@jimmahosp.gov.et` / `password`

### Patient Accounts
- **Patient**: `patient1@medilink.demo` / `password`
- **Patient**: `patient2@medilink.demo` / `password`
- **Almaz Kebede**: `almaz.k@medilink.patient` / `password`
- **Tekle Hailu**: `tekle.h@medilink.patient` / `password`

---

## Quick Start

1. Start backend API on port `3001`
2. Set frontend `.env` with: `VITE_API_BASE_URL=http://localhost:3001/api`
3. Start frontend: `npm run dev`
4. Open `/login`
5. Use one of the **Real Backend Seed Accounts** above

---

## Notes

- Mock mode accounts are defined in `src/features/auth/services/authService.ts`.
- Real backend accounts are inserted by `database/migrations/004_seed_demo_users.up.sql`.
- If you changed credentials or reset passwords, update this file accordingly.
- Default password for all seeded real backend accounts above is `password` unless changed.
