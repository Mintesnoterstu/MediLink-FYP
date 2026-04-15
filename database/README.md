# MediLink database (PostgreSQL)

Schema, row-level security, seeds, and a small Node.js client for encryption and session-scoped queries.

## Apply migrations (order)

Run as a superuser (or any role that bypasses RLS) for seeds — for example the `postgres` user on local dev:

```bash
psql "$DATABASE_URL" -f migrations/001_schema.up.sql
psql "$DATABASE_URL" -f migrations/002_rls.up.sql
psql "$DATABASE_URL" -f migrations/003_seed_geography.up.sql
psql "$DATABASE_URL" -f migrations/004_seed_demo_users.up.sql
psql "$DATABASE_URL" -f migrations/005_seed_diseases_medicines_sample.up.sql
```

Rollback (destructive):

```bash
psql "$DATABASE_URL" -f migrations/002_rls.down.sql
psql "$DATABASE_URL" -f migrations/001_schema.down.sql
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/medilink` |
| `ENCRYPTION_KEY` | 32-byte AES key: **64-char hex** or **base64** encoding 32 raw bytes |
| `JWT_SECRET` | Sign JWTs in your API (not read by SQL) |
| `SUPABASE_URL` / keys | Optional; use Supabase `DATABASE_URL` from the project settings |

## RLS and the API

Policies use PostgreSQL settings:

- `medilink.user_id` — UUID of the current principal (`users.id`).
- `medilink.role` — e.g. `patient`, `doctor`, `service_role`.

The Node helper `withMedilinkSession` runs `set_config(..., true)` per transaction so values are **transaction-local**.

Use `service_role` only from trusted server code (registration, migrations, break-glass tools).

## Static content (30 diseases / 20 medicines)

The repo mock lists **8** diseases and **8** medicines. Migration `005` adds **one** disease and **one** medicine as samples. To reach 30/20, copy rows from `frontend/src/data/diseasesData.ts` and `medicinesData.ts` into new `INSERT` statements (same column layout as `005`).

## Node client

```bash
cd database/node
npm install
# set DATABASE_URL (and ENCRYPTION_KEY to test decrypt)
npm run example
```

See `node/examples/usage.mjs` for patterns: load patient with decrypted JSON blob, list patients for a doctor with consent, append audit rows, read audit history.

## Cross-lingual RAG (chatbot)

The Flask chatbot translates Amharic queries to English for Pinecone retrieval, then answers in Amharic using English context. See `backend/chatbot/app.py`, `translation.py`, and `prompt.py`.

Optional debug field on the chat response when `CHATBOT_DEBUG_RETRIEVAL=true`: `retrieval_query_en`.
