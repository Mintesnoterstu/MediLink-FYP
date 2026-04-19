# MediLink API (`backend/api`)

Main backend service for MediLink on port `3001`.

## Run

1. Copy `.env.example` to `.env` in project root.
2. Ensure DB schema + RLS + seeds are applied from `database/migrations`.
3. Install and run:

```bash
cd backend/api
npm install
npm run start
```

## Core endpoints

- `POST /api/auth/login` (email/phone + password, optional 2FA challenge)
- `POST /api/auth/verify-2fa`
- `POST /api/patients/register` (facility admin)
- `GET /api/patients/:id`
- `GET /api/patients/search?q=...` (doctor)
- `PUT /api/patients/:id`
- `GET /api/professionals/patients`
- `POST /api/professionals/consents/request`
- `GET /api/professionals/consents/pending`
- `POST /api/professionals/records`
- `PUT /api/professionals/records/:id`
- `GET /api/consents/active`
- `GET /api/consents/pending`
- `POST /api/consents/grant/:requestId`
- `DELETE /api/consents/:id/revoke`
- `GET /api/consents/history`
- `GET|POST|PUT|DELETE /api/appointments`
- `GET /api/diseases`, `GET /api/diseases/:id`
- `GET /api/medicines`, `GET /api/medicines/:id`
- `GET /api/audit/patient/:id`, `GET /api/audit/admin`
- `POST /api/admin/users`, `GET /api/admin/users`, `PUT /api/admin/users/:id/suspend`
- `POST /api/admin/facilities`, `POST /api/admin/professionals`
- `GET /api/admin/statistics`, `GET /api/admin/audit`

## Security implementation

- JWT auth in `Authorization: Bearer <token>`
- 2FA OTP flow via Twilio when `two_factor_enabled=true`
- RLS backed access control (`medilink.user_id`, `medilink.role`)
- No admin patient-data reads (enforced by RLS + API routing)
- Auto-revoke consent on professional record create/update (`status='pending'`, `auto_revoked=true`)
- AES-256-GCM app-layer encryption for patient and record payloads
- Rate limiting: `100 req/min`
