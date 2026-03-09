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

### Chatbot backend (Python + Flask)

A dedicated medical chatbot backend lives in `backend/chatbot/`.

Files:

- `backend/chatbot/helper.py` — utilities (PDF loading, text splitting, embeddings, env loading)
- `backend/chatbot/prompt.py` — English + Amharic system prompts
- `backend/chatbot/store_index.py` — one-time script to index the medical PDF into Pinecone
- `backend/chatbot/app.py` — Flask API (`/api/chat`) for the chatbot
- `backend/chatbot/requirements.txt` — Python dependencies

Expected data and env:

- PDF: `data/medical-book.pdf`
- Env (root): `.env` with `PINECONE_API_KEY` and `OPENAI_API_KEY`

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


