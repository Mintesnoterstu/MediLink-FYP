# MediLink — Backend Information (Notes)

This document describes what the frontend expects from the backend. It is a **note only** (no code). Use it when building or integrating the API.

---

## Overview

- The app is a **digital health platform** for patients, doctors, and administrators (Jimma Zone).
- **Frontend** uses React, Vite, TypeScript; it calls a REST API when `VITE_API_BASE_URL` is set.
- **Without a backend**, the app runs in development mode and uses mock data (auth, patients, appointments, medications, etc.).
- **Diseases** and **medicines** are currently **mock/local data**; the UI is prepared to load them from the API when the backend is ready.

---

## Base URL and environment

- **Expected base URL:** `VITE_API_BASE_URL` (e.g. `http://localhost:3001/api`). If not set, frontend assumes no backend and uses mocks.
- All requests that need auth send: **Authorization: Bearer &lt;token&gt;** (token from login, stored in `localStorage` as `auth_token`).
- **Content-Type:** `application/json` for request/response bodies.

---

## Authentication

- **POST /auth/login** — Body: email, password. Returns: user object and token.
- **POST /auth/register** — Body: email, password, name, role. Returns: user and token (or error).
- **PATCH /auth/users/:userId** — Update user profile (authenticated).
- **POST /auth/reset-password** — Body: email. For password reset flow.
- **Roles:** patient, provider, admin. User object may include: id, email, name, role, language, zone, facility, woreda, city, adminLevel, professionalType, licenseNumber, etc., depending on role.

---

## Patients and health data

- **GET /patients/:patientId** — Returns full patient health data (demographics, medical history, current medications, allergies, vital signs, emergency contacts). Used for dashboard and records.
- **PATCH /patients/:patientId** — Update patient data (partial update).
- Frontend expects patient data to include: id, userId, age, gender, medicalHistory, currentMedications, allergies, vitalSigns, emergencyContacts, and optionally appointments.

---

## Appointments

- **GET /patients/:patientId/appointments** — List appointments for a patient.
- **POST /appointments** — Create appointment (body includes patientId, provider, date, time, etc.).
- **PATCH /appointments/:id** — Update an existing appointment.
- Frontend uses these for the appointments page and dashboard; when API is unavailable it falls back to mock appointments.

---

## Medications

- **PATCH /medications/:id** — Update a medication (e.g. dosage, frequency, reminder).
- **POST /medications** — Add a new medication for a patient.
- **DELETE /medications/:medicationId** — Remove a medication.
- Medication object typically includes: id, name, dosage, frequency, startDate, reminderEnabled, etc.

---

## Vital signs

- **POST /vital-signs** — Submit new vital signs (e.g. blood pressure, heart rate, temperature, weight, date). Body shape should match the VitalSigns type used in the frontend.

---

## Symptom analyses and AI recommendations

- **GET /patients/:patientId/symptom-analyses** — List symptom analyses for the patient (e.g. from AI or clinician).
- **GET /patients/:patientId/ai-recommendations** — List AI-generated health recommendations.
- Frontend can work with empty arrays if these are not yet implemented; mock AI recommendations are used when API fails or is not configured.

---

## Diseases (to be added with backend)

- **Current:** Disease list is loaded from **local mock data** (e.g. `diseasesData.ts`). The disease page shows a fixed set of diseases with bilingual content (English/Amharic).
- **Future:** When the backend is ready, the frontend can be wired to:
  - **GET /diseases** (or similar) — List diseases, with optional filters (category, symptoms, body region).
  - **GET /diseases/:id** — Single disease detail (description, symptoms, causes, prevention, treatment, body regions, seasonal info, **image URL**).
- Disease fields the UI uses: id, name, nameAmharic, category, description, descriptionAmharic, symptoms, symptomsAmharic, causes, causesAmharic, prevention, preventionAmharic, treatment, treatmentAmharic, bodyRegions, severity, seasonal, seasonalAmharic. An **image** (or image URL) is expected for the detail view; video was removed in favor of image.

---

## Medicines / remedies (to be added with backend)

- **Current:** Medicine/remedy list is **local mock data** (e.g. `medicinesData.ts`). The medicine page shows traditional remedies and OTC medicines with bilingual content.
- **Future:** When the backend is ready, the frontend can be wired to:
  - **GET /medicines** or **GET /remedies** (or similar) — List with optional filters (body part, health goal, category).
  - **GET /medicines/:id** or **GET /remedies/:id** — Single remedy/medicine detail.
- Remedy fields the UI uses: id, name, nameAmharic, category (traditional/modern), bodyPart, healthGoal, description, preparation, dosage, indications, contraindications, safetyWarnings, culturalContext, ministryApproved, verificationLevel, scientificEvidence, and bilingual variants. An **image** (or image URL) is expected for cards and detail; the UI has placeholders for images (not video).

---

## Consent and access control

- The app is designed so that **only doctors with patient consent** can access that patient’s data.
- **Any access to patient data should be logged** and visible to the patient (audit trail).
- **Admin** can manage facilities and users but **must not** have access to patient clinical data.
- Backend should enforce: consent checks before returning patient data, and logging of every access. Exact endpoints (e.g. consent grant/revoke, access log) can be defined when the backend is implemented; the frontend already has consent and access-history UI.

---

## Security (high level)

- **Authentication:** JWT (or similar) in `Authorization: Bearer &lt;token&gt;`.
- **HTTPS** in production.
- **CORS** must allow the frontend origin.
- **Sensitive data:** Encrypt at rest and in transit as per policy (e.g. AES-256, TLS 1.3 mentioned in the About page).
- **Two-factor authentication** and **audit trail** are mentioned in the app; backend should support them when implemented.

---

## Summary of what the frontend expects

| Area            | Status        | Notes                                                                 |
|-----------------|---------------|-----------------------------------------------------------------------|
| Auth            | Expected      | Login, register, reset password; JWT in header.                       |
| Patients        | Expected      | GET/PATCH patient; full health data shape.                           |
| Appointments    | Expected      | CRUD for appointments linked to patient.                              |
| Medications     | Expected      | Add, update, delete medications.                                      |
| Vital signs     | Expected      | POST vital signs.                                                    |
| Symptom / AI    | Optional      | Endpoints for analyses and AI recommendations; mocks used if absent.|
| Diseases        | Future        | API for list + detail; image URL; more diseases when DB is ready.     |
| Medicines       | Future        | API for list + detail; image URL; placeholders for images in UI.     |
| Consent / audit | Design goal   | Consent-based access and full audit trail for patient data.          |

When the backend and database are ready, diseases and medicines can be added and the frontend updated to call the new endpoints instead of mock data.
