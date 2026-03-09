# MediLink (Monorepo)

This repository is organized into **frontend** and **backend** folders.

## Structure

```
medl/
├── frontend/           # React + Vite + TypeScript UI
├── backend/            # Backend services (to be implemented)
├── .env                # Environment variables (kept at repo root)
└── data/               # Local data files (kept at repo root)
```

## Frontend

### Run locally

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### Build

```bash
cd frontend
npm run build
```

### Notes

- The frontend is configured to read environment variables from the **repo root** `../.env`.

## Backend

Backend work is not started yet. See:

- `backend/BACKEND_NOTE.md`

