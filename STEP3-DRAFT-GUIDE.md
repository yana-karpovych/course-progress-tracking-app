# Крок 3 — Чернетка (draft). Детальний гайд виконання

> Це робочий документ для Яни. Чернетка = БЕЗ відео.
> Cursor Agent читає: цей файл + REQUIREMENTS.md.

---

## Що таке крок 3 одним абзацом

Ти в **приватній папці** `course-progress-tracker-draft` доводиш проєкт до стану:
`docker compose up --build` → створити курс → уроки → галочка → прогрес → delete.

Порядок строгий:
1. Git + Cursor + Superpowers
2. Backend + база (локально, postgres у Docker)
3. Frontend (підключений до API)
4. Docker Compose (все разом)
5. Зелений шлях (чекліст з REQUIREMENTS.md §11)
6. Git commit + push

Не поліруй. Не додавай фічі з §10 «НЕ робимо».

---

## Документи в папці — що достатньо для Cursor

| Файл | Потрібен? | Навіщо |
|---|---|---|
| `REQUIREMENTS.md` | ✅ обов'язково | Стек, API, валідація, прогрес, ризики |
| `STEP3-DRAFT-GUIDE.md` | ✅ цей файл | Порядок кроків і промпти |
| `.gitignore` | ✅ | Не комітити node_modules, .env |
| `backend/.env` | ✅ локально | DATABASE_URL — **не в git** |
| `backend/.env.example` | ✅ | Шаблон без секретів |
| Оригінальне ТЗ PDF/README | ❌ | Все вже в REQUIREMENTS.md |
| Промпти в чаті | ✅ | Кожен крок — явний промпт |

**Відповідь:** `REQUIREMENTS.md` + цей гайд + промпти **достатньо**. Cursor не потребує PDF з ТЗ.

---

## Superpowers — коли використовувати

| Skill | Коли | Коли НЕ |
|---|---|---|
| `executing-plans` | Кожен промпт на код (кроки 3.x) | — |
| `verification-before-completion` | Кінець кожного крока | — |
| `systematic-debugging` | Помилка в терміналі | — |
| `receiving-code-review` | Фідбек від рев'ю | — |
| `finishing-a-development-branch` | Конець фази (бекенд, фронт, docker) | — |
| `brainstorming` | — | План уже є |
| `writing-plans` | — | План уже є |
| `test-driven-development` | — | Не в ТЗ |
| `dispatching-parallel-agents` | — | Задача мала |
| `subagent-driven-development` | — | Занадто складно |

**Як викликати:** додай 1–2 рядки в промпт (slash не обов'язковий):
`executing-plans: ONLY [крок]. Stop. verification-before-completion: give Windows PowerShell Invoke-RestMethod commands.`

---

## Налаштування (один раз)

### A1. Git

```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft
git init
```

`.gitignore`:
```
node_modules/
.env
dist/
```

```powershell
git add REQUIREMENTS.md STEP3-DRAFT-GUIDE.md .gitignore
git commit -m "Add requirements and draft guide"
# git remote add origin ... && git push -u origin main
```

### A2. Cursor

- Open Folder → `course-progress-tracker-draft`
- **Новий Agent chat** (не цей стратегічний)
- Модель: **composer-2.5-fast**
- `/add-plugin superpowers` → Install → **новий чат**

### A3. Блок Superpowers (перше повідомлення в чаті)

```
Superpowers mode for this session:

- executing-plans: one step at a time, stop after each step
- verification-before-completion: never claim success without my terminal checks
- systematic-debugging: only when I paste errors
- Do NOT use: brainstorming, writing-plans, TDD, parallel agents, subagent-driven-development

Read REQUIREMENTS.md and STEP3-DRAFT-GUIDE.md. We build DRAFT backend first.
```

---

## Фаза B — Backend (локально)

**Ціль фази:** API на `localhost:4000`, база в Docker postgres, всі 9 ендпоінтів, API-тести зелені.

**Що НЕ робимо в цій фазі:** frontend, docker-compose для backend, production compose.

---

### ⚠️ Windows PowerShell — як тестувати API (читай перед B5)

**Це не баг коду.** На Windows PowerShell команда `curl` — **alias** для `Invoke-WebRequest`, не Unix curl.
Синтаксис `\"title\"` з bash **не працює** → помилки `Port number was not a decimal number`.

#### Два термінали

| Термінал 1 | Термінал 2 |
|---|---|
| `cd backend` → `npm run dev` | тільки тести API |
| **Не закривай.** Чекай: `Server started on port 4000` | не запускай `npm run dev` знову |

#### EADDRINUSE (port 4000 already in use)

Сервер **вже працює** — це ок, тестуй у терміналі 2.

Якщо треба перезапустити:
1. У терміналі 1: `Ctrl+C`
2. Або: `Stop-Process -Id <PID> -Force` (PID з тексту помилки)
3. Потім знову `npm run dev`

#### `Failed to connect` (curl 7)

Сервер **не запущений**. Запусти `npm run dev` в терміналі 1 і чекай старт.

#### Рекомендований спосіб тестів — `Invoke-RestMethod`

Копіюй блоки нижче в **термінал 2** (сервер уже працює).

**Health (B1):**
```powershell
Invoke-RestMethod http://localhost:4000/health
```

**Курси (B5):**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":"JS Basics","description":"test"}'
Invoke-RestMethod http://localhost:4000/courses
Invoke-RestMethod http://localhost:4000/courses/1
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":""}'
Invoke-RestMethod -Method DELETE -Uri http://localhost:4000/courses/1
```

**Уроки (B6) — після B6:**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":"Test"}'
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses/1/lessons -ContentType "application/json" -Body '{"title":"Lesson 1"}'
Invoke-RestMethod -Method PATCH -Uri http://localhost:4000/lessons/1 -ContentType "application/json" -Body '{"isCompleted":true}'
Invoke-RestMethod -Method PATCH -Uri http://localhost:4000/lessons/1 -ContentType "application/json" -Body '{"isCompleted":"true"}'
```

**Альтернатива — `curl.exe` (не `curl`):**
```powershell
curl.exe --% -X POST http://localhost:4000/courses -H "Content-Type: application/json" -d "{\"title\":\"JS Basics\"}"
```
`--%` зупиняє парсинг PowerShell.

**Для Cursor:** у промптах проси «PowerShell `Invoke-RestMethod` commands», не bash `curl`.

---

### B0. Контекст для агента

**Superpowers:** executing-plans (легкий), brainstorming ❌

**Промпт:**
```
Read REQUIREMENTS.md sections 2, 3, 4, 5.

List all 9 API endpoints with HTTP method and path.
Confirm: backend JS only, progress on backend, Prisma, port 4000.
Do not write code yet.
```

**Ти перевіряєш:** 9 ендпоінтів, без коду.

---

### B1. Scaffold Express

**Що з'явиться в проєкті:**
```
backend/
  package.json
  src/index.js
  .env.example
```

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B1 ONLY — backend scaffold.

Create:
- backend/package.json: express, cors; scripts start + dev (node --watch)
- backend/src/index.js: Express port 4000, express.json(), cors(), GET /health -> { status: "ok" }
- backend/.env.example: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/courses_db

NO Prisma. NO course/lesson routes. NO frontend. NO docker-compose.yml yet.
verification-before-completion: list files created.
```

**Ти в терміналі:**
```powershell
cd backend
npm install
npm run dev
```

**Ти перевіряєш:**
```powershell
Invoke-RestMethod http://localhost:4000/health
```
→ `status : ok` (або JSON з `ok`)

**Якщо не працює:** systematic-debugging + paste error.

**Git (опційно):** `git add backend && git commit -m "Add backend scaffold with health endpoint"`

---

### B2. Prisma schema + .env

**Що з'явиться:**
```
backend/prisma/schema.prisma
backend/src/prisma.js
backend/.env          (локально, НЕ в git — копія з .env.example)
```

**Важливо:** Prisma читає `DATABASE_URL` з `backend/.env` уже на цьому кроку
(`prisma validate`, `prisma generate`). Postgres **ще не потрібен** для validate —
лише файл `.env` має существувати. Контейнер postgres піднімаємо в B3; міграція в B4.

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B2 ONLY — Prisma schema + local .env.

Add prisma + @prisma/client to package.json.
Create schema.prisma with Course and Lesson exactly as REQUIREMENTS.md section 3 (onDelete Cascade).
Create src/prisma.js — single PrismaClient export.

Ensure backend/.env.example exists. Tell me to copy it to backend/.env
(or create .env from .env.example — .env must NOT be committed).

NO migrations yet. NO API routes.
verification-before-completion: give command npx prisma validate.
```

**Ти в терміналі:**
```powershell
cd backend
copy .env.example .env
npx prisma validate
```

**Ти перевіряєш:**
- `schema.prisma` — 2 models, Cascade, поля title, isCompleted, etc.
- `npx prisma validate` → «schema is valid» (postgres може ще не працювати)
- `.env` **не** в git (`git status` не показує .env)

---

### B3. Postgres для розробки

**Що з'явиться:**
```
docker-compose.dev.yml   (тільки postgres)
```

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step B3 ONLY.

Create docker-compose.dev.yml at project root:
- single service postgres:16
- user/password/db: postgres/postgres/courses_db
- port 5432:5432
- volume for data persistence

NO backend or frontend in this file.
```

**Ти в терміналі:**
```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft
docker compose -f docker-compose.dev.yml up -d
docker ps
```

**Ти перевіряєш:** контейнер postgres running.

---

### B4. Міграція

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B4 ONLY — Prisma migrate setup.

Add script prisma:migrate to package.json.
Ensure .env.example is correct for localhost:5432.

Tell me exact commands to run migration "init".
Do NOT implement routes.
```

**Ти в терміналі:**
```powershell
cd backend
npx prisma migrate dev --name init
```

(`.env` уже створений в B2 — не копіюй знову.)

**Ти перевіряєш:**
- без помилок
- опційно: `npx prisma studio` — таблиці Course, Lesson

**Типові помилки:**
- `Can't reach database` → postgres не запущений (зроби B3 спочатку) або wrong DATABASE_URL
- `Environment variable not found: DATABASE_URL` → забули `.env` в B2
- `localhost` vs `postgres` — тут **localhost** (бекенд локально, не в Docker)

---

### B5. Ендпоінти курсів

**Що з'явиться:**
```
backend/src/routes/courses.js
backend/src/utils/progress.js  (or inline helper)
```

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B5 ONLY — course endpoints.

Implement in routes/courses.js:
- GET /courses — list with totalLessons, completedLessons, progress per course
- GET /courses/:id — course + lessons + progress (404 if missing)
- POST /courses — title required non-empty (400 otherwise)
- PATCH /courses/:id — update title/description with validation
- DELETE /courses/:id — 204 or 404

Use calculateProgress from REQUIREMENTS.md section 4 (0 lessons = 0%).
Wire routes in index.js.

NO lesson routes in this step.
verification-before-completion: provide Windows PowerShell Invoke-RestMethod commands (not bash curl).
```

**Перед тестом:** термінал 1 — `npm run dev` працює. Термінал 2 — команды ниже. См. § «Windows PowerShell» выше.

**Ти перевіряєш (термінал 2, PowerShell):**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":"JS Basics","description":"test"}'
Invoke-RestMethod http://localhost:4000/courses
Invoke-RestMethod http://localhost:4000/courses/1
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":""}'
Invoke-RestMethod -Method DELETE -Uri http://localhost:4000/courses/1
```

Очікування: POST → курс з id; GET list → `progress: 0`; GET /1 → `lessons: []`; POST empty → помилка 400; DELETE → без body (204).

---

### B6. Ендпоінти уроків

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B6 ONLY — lesson endpoints.

Implement routes/lessons.js:
- GET /courses/:courseId/lessons
- POST /courses/:courseId/lessons — title required, course must exist
- PATCH /lessons/:id — isCompleted must be boolean if sent; can update title
- DELETE /lessons/:id

Do not change course routes logic.
verification-before-completion: Windows PowerShell Invoke-RestMethod commands (not bash curl).
```

**Ти перевіряєш (термінал 2):**
```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses -ContentType "application/json" -Body '{"title":"Test"}'
Invoke-RestMethod -Method POST -Uri http://localhost:4000/courses/1/lessons -ContentType "application/json" -Body '{"title":"Lesson 1"}'
Invoke-RestMethod -Method PATCH -Uri http://localhost:4000/lessons/1 -ContentType "application/json" -Body '{"isCompleted":true}'
Invoke-RestMethod -Method PATCH -Uri http://localhost:4000/lessons/1 -ContentType "application/json" -Body '{"isCompleted":"true"}'
```

→ 400 на string `"true"` (Invoke-RestMethod покаже помилку з `error` в тексті).

---

### B7. Прогрес і cascade

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step B7 ONLY — verify progress and cascade.

Prove with Invoke-RestMethod sequence (see Windows PowerShell section):
1) 4 lessons, 1 completed -> 25%
2) 0 lessons -> 0% not NaN
3) DELETE course removes all lessons

Fix minimal bugs only.
```

**Ти перевіряєш вручну** сценарій з REQUIREMENTS.md §11 (пункти 6–9, 15).

---

### B8. Закриття фази backend

**Superpowers:** finishing-a-development-branch ✅ | receiving-code-review ✅

**Промпт:**
```
finishing-a-development-branch: backend phase done.

Compare implemented API vs REQUIREMENTS.md section 5.
List gaps if any. Suggest git commit message.
Do NOT start frontend.
```

**Ти:**
```powershell
git add .
git commit -m "Add backend API with Prisma and all course/lesson endpoints"
git push
```

---

## Фаза C — Frontend (короткий порядок)

Новий чат або той самий + блок Superpowers. Модель composer.

| Крок | Що | Superpowers |
|---|---|---|
| C1 | Vite React+TS в `frontend/`, proxy або API_URL 4000 | executing-plans |
| C2 | types.ts, api.ts | executing-plans |
| C3 | CoursesPage — список, форма, progress, delete | executing-plans |
| C4 | CourseDetailsPage — уроки, checkbox, progress bar | executing-plans |
| C5 | Edit course/lesson (optional) | executing-plans |
| C6 | Loading + error states | executing-plans |
| C7 | finishing-a-development-branch | finishing |

**Перевірка:** браузер `localhost:5173` (Vite) або 3000 — кліки по сценарію §11.

**Промпт C1 пример:**
```
executing-plans: Step C1 ONLY.

Create frontend with Vite React+TypeScript in frontend/.
Configure dev server to call backend at http://localhost:4000.
Add react-router-dom. Plain CSS in index.css only.

NO Docker yet. NO Tailwind.
Read REQUIREMENTS.md section 6 for pages structure.
```

---

## Фаза D — Docker Compose (production)

| Крок | Що | Superpowers |
|---|---|---|
| D1 | backend/Dockerfile + migrate on start | executing-plans |
| D2 | frontend/Dockerfile | executing-plans |
| D3 | docker-compose.yml 3 services, volumes, CORS | executing-plans |
| D4 | `docker compose up --build` | verification-before-completion |
| D5 | finishing-a-development-branch | finishing |

**DATABASE_URL в compose для backend:** host = `postgres` (не localhost).

**Перевірка:** §11 пункт 1, 14 — down/up, дані живі.

---

## Фаза E — Зелений шлях

Пройти REQUIREMENTS.md §11 всі 15 пунктів. Записати в `DRAFT-NOTES.md` що зламалось і як фіксили — для фінального відео.

**Superpowers:** verification-before-completion на весь чекліст.

---

## Шаблон при помилці

```
systematic-debugging: Step [B5] failed.

Terminal output:
[paste]

Files involved:
[list]

Minimal fix only. No refactor.
```

---

## Шаблон одной строки Superpowers (копируй в любой промпт)

```
executing-plans + verification-before-completion: ONE step only — [опис]. Stop. Give me verification commands.
```
