# Course Progress Tracker

Full-stack app for tracking course and lesson progress.

## How to Run

### Docker (recommended)

From the project root:

```bash
docker compose down
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:4000 |
| Postgres | localhost:5432 |

Health check (PowerShell):

```powershell
Invoke-RestMethod http://localhost:4000/health
```

Stop containers:

```bash
docker compose down
```

Data persists in the `postgres_data` Docker volume. To verify: create a course, run `docker compose down`, then `docker compose up` — the course should still be there.

### Local development

Postgres only in Docker:

```bash
docker compose -f docker-compose.dev.yml up
```

Backend:

```bash
cd backend
cp .env.example .env   # DATABASE_URL uses localhost
npm install
npx prisma migrate dev
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Vite dev server proxies `/api` to `http://localhost:4000`.

## Technologies

- **Backend:** Node.js, Express, Prisma, PostgreSQL
- **Frontend:** React, TypeScript, Vite, react-router-dom
- **Docker:** Docker Compose (frontend, backend, postgres)

## Docker

- `backend/Dockerfile` — Node 20 Alpine; runs `prisma migrate deploy` then starts the API on port 4000
- `frontend/Dockerfile` — multi-stage build; nginx serves static files on port 3000 and proxies `/api` to the backend service
- `docker-compose.yml` — three services with `postgres_data` volume and `depends_on` startup order
- `docker-compose.dev.yml` — local-only Postgres for npm-based development

Inside Compose, the backend uses:

```txt
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/courses_db
```

## API Endpoints

<!-- TODO: list endpoints before submission -->

## Database

<!-- TODO: describe Course / Lesson models before submission -->

## What Is Completed

- [x] REST API with course and lesson CRUD
- [x] Progress calculated on the backend
- [x] React UI (courses list, course details, lesson completion)
- [x] Docker Compose setup (frontend :3000, backend :4000, postgres :5432)

## What Is Not Completed

<!-- TODO: fill before submission -->

## AI Usage Report

<!-- TODO: tool used, prompts, what was edited manually, what was difficult -->
