# MediLink-FYP Deployment Guide

This guide is tailored to **this repo** (`MediLink-FYP/`) and the current backend/frontend setup.

## Architecture (what you deploy)

- **Backend API**: `backend/api` (Express + PostgreSQL)  
  - Default: `http://localhost:3001/api`
- **Frontend**: `frontend` (React + Vite build output in `frontend/dist`)
- **Database**: Postgres + migrations in `database/`

## Required environment variables

Use `MediLink-FYP/.env.example` as the base. In production you must set at minimum:

- **Backend**
  - `NODE_ENV=production`
  - `PORT=3001`
  - `FRONTEND_URL=https://<your-frontend-domain>`
  - `DATABASE_URL=postgresql://<user>:<pass>@<host>:5432/<db>`
  - `JWT_SECRET=<very-long-random-secret>`
  - `ENCRYPTION_KEY=<64 hex chars>`

- **Frontend**
  - `VITE_API_BASE_URL=https://<your-api-domain>/api`
  - `VITE_CHATBOT_API_URL=...` (only if you deploy chatbot service)

## Database (migrations)

On the machine that can access Postgres:

```bash
cd MediLink-FYP/database/node
npm install
npm run migrate:up
```

If you prefer using the backend’s auto-migration script locally:

```bash
cd MediLink-FYP/backend/api
npm run start:clean
```

## Production deploy (Linux recommended)

### 1) Install prerequisites

- Node.js 18+ (recommended)
- PostgreSQL 14+
- Nginx
- PM2

```bash
npm i -g pm2
```

### 2) Backend deploy (PM2)

```bash
cd MediLink-FYP/backend/api
npm install
pm2 start src/server.js --name medilink-api
pm2 save
pm2 startup
```

Backend health check:

```bash
curl http://127.0.0.1:3001/api/health
```

### 3) Frontend deploy (static build)

```bash
cd MediLink-FYP/frontend
npm install
npm run build
```

Your static files will be in:

- `MediLink-FYP/frontend/dist`

### 4) Nginx (reverse proxy + static hosting)

Example Nginx blocks (adjust domains/paths):

#### Frontend (`https://portal.example.com`)

```nginx
server {
  listen 80;
  server_name portal.example.com;

  root /var/www/medilink/frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

#### Backend API (`https://api.example.com/api`)

```nginx
server {
  listen 80;
  server_name api.example.com;

  location /api/ {
    proxy_pass http://127.0.0.1:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Add HTTPS with Let’s Encrypt (recommended):

- Install certbot
- Enable TLS for both `portal.*` and `api.*`

## Production deploy (Windows Server option)

You can deploy on Windows, but Linux is easier for Nginx + process management.

Minimal Windows approach:

- Run backend with **PM2** (works on Windows).
- Serve frontend `dist` with:
  - IIS static site, or
  - `npx serve -s dist` behind a reverse proxy.

## Smoke test checklist (post-deploy)

- **Backend**
  - `GET /api/health` returns `{status:"ok"}`
  - login works
  - patient `/api/patient/me` works after login
  - consent request flow works (professional → patient approve)

- **Frontend**
  - patient dashboard loads real profile + health id
  - record detail modal renders structured details
  - “Health Summary” shows real values (profile/vitals/appointments/consents)
  - professional can cancel pending consent request
  - patient can revoke consent

## Important operational notes

- **Secrets**
  - Never commit `.env` files.
  - Set `JWT_SECRET` and `ENCRYPTION_KEY` securely for production.

- **Ports**
  - Backend default port is `3001`.
  - Frontend is static (no port needed if served by Nginx/IIS).

