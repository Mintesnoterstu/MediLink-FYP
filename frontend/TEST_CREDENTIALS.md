# MediLink Test Credentials

## Development Mode Test Accounts

The application includes mock authentication for development/testing purposes. Use these credentials to log in:

### Patient Account
- **Email:** `patient@medilink.test`
- **Password:** `patient123`
- **Role:** Patient
- **Access:** Health Dashboard, Symptom Tracker, Medication Manager, Appointments

### Provider Account
- **Email:** `provider@medilink.test`
- **Password:** `provider123`
- **Role:** Healthcare Provider
- **Access:** Provider Dashboard, Patient Finder, Medical Records Viewer, Consent Manager

### Zonal Admin Account
- **Email:** `admin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Zonal)
- **Access:** System Analytics, User Management, Content Curator

### Woreda Admin Account
- **Email:** `woredaadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Woreda)
- **Access:** Facility Management, Woreda-level admin workflow

### City Admin Account
- **Email:** `cityadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (City)
- **Access:** City-level facility and admin workflow

### Facility Admin Account
- **Email:** `facilityadmin@medilink.test`
- **Password:** `admin123`
- **Role:** Administrator (Facility)
- **Access:** Professional Management, Patient Registration

## Notes

- These credentials work in **development mode** only (when `VITE_API_BASE_URL` is not set)
- In production, you'll need to register accounts through the registration form or use your backend API
- All test accounts use English (`en`) as the default language
- Available mock login accounts come from `src/features/auth/services/authService.ts`
- You can also register new accounts using the registration form at `/register`

## Quick Start

1. Start the development server: `npm run dev`
2. Navigate to `/login`
3. Use any of the test credentials above
4. You'll be automatically logged in and redirected to the dashboard


