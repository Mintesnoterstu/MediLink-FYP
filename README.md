# MediLink-FYP (Local Setup & Testing)

This repo contains:

- `backend/` (Express API + Postgres)
- `frontend/` (React + Vite + MUI)
- `database/` (SQL migrations + migration runner)

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- Postgres 14+

## Environment variables

Create a `.env` file in **`MediLink-FYP/backend/api/`** (or ensure your existing `.env` is loaded by your start script).

Minimum required:

```env
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/medilink
JWT_SECRET=your_secret_here
```

Frontend can optionally set:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Database migrations

Run migrations (idempotent):

```bash
cd database/node
npm install
npm run migrate:up
```

If you use the API start script that applies migrations automatically, you can skip this step.

## Run the backend API

From `MediLink-FYP/backend/api`:

```bash
npm install
npm run start:clean
```

The API base URL should be:

- `http://localhost:3001/api`

## Run the frontend

From `MediLink-FYP/frontend`:

```bash
npm install
npm run dev
```

Open the printed Vite URL (usually `http://localhost:5173`).

## Testing checklist (manual)

### Facility Admin: patient registration should appear in list

1. Login as **Facility Admin**
2. Open **Facility Admin Dashboard**
3. Register a patient using **Patient Registration**
4. Confirm:
   - A success message shows Ethiopian Health ID
   - The patient appears in **Patients List (Basic Info Only)**

If the patient does not appear, common causes:

- One of the dashboard endpoints fails (e.g. audit). The UI now loads each section independently, so patients should still show.
- Facility admin account not linked to a facility (`users.facility_id` missing). The backend attempts to backfill using `facilities.facility_admin_id`.

### Doctor/Nurse: patient appears only after consent

1. Login as **Doctor** or **Nurse**
2. Request consent using Ethiopian Health ID
3. Patient approves the request in Patient Dashboard
4. Doctor/Nurse dashboard should show the patient in **My Patients**

## Build (TypeScript)

From `MediLink-FYP/frontend`:

```bash
npm run build
```

# MediLink (Monorepo)

This repository is organized into **frontend** and **backend** folders.

## Structure

```
medl/
├── frontend/           # React + Vite + TypeScript UI
├── backend/            # Backend services (chatbot in backend/chatbot)
├── database/           # PostgreSQL migrations, seeds, Node DB client (see database/README.md)
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

### Chatbot backend (Python + Flask)

A dedicated medical chatbot backend lives in `backend/chatbot/`.

Files:

- `backend/chatbot/helper.py` — utilities (PDF loading, text splitting, embeddings, env loading)
- `backend/chatbot/prompt.py` — English + Amharic system prompts
- `backend/chatbot/store_index.py` — one-time script to index the medical PDF into Pinecone
- `backend/chatbot/app.py` — Flask API (`/api/chat`) for the chatbot (cross-lingual RAG: Amharic → English for retrieval, answer in Amharic)
- `backend/chatbot/translation.py` — DeepSeek translation step for retrieval queries
- `backend/chatbot/llm_client.py` — shared DeepSeek HTTP client
- `backend/chatbot/requirements.txt` — Python dependencies

Expected data and env:

- PDF: `data/medical-book.pdf`
- Env (root): `.env` with `PINECONE_API_KEY`, `DEEPSEEK_API_KEY` (Flask RAG chat), and `VITE_DEEPSEEK_API_KEY` (same value, for Vite client AI helpers)

#### Setup steps

```bash
cd backend/chatbot
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Create the Pinecone index and upload embeddings (run once):

```bash
cd backend/chatbot
python store_index.py
```

Run the Flask app:

```bash
cd backend/chatbot
python app.py
```

The chatbot API will be available at `http://localhost:5001/api/chat`.

On the frontend, you can set:

```bash
# in .env (root)
VITE_CHATBOT_API_URL=http://localhost:5001/api/chat
```

and then restart `npm run dev`.


