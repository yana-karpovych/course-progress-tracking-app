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

## Фаза C — Frontend (детально)

**Ціль:** React UI на `http://localhost:5173`, підключений до API `localhost:4000`.

**Два термінали під час розробки:**

| Термінал 1 | Термінал 2 |
|---|---|
| `cd backend` → `npm run dev` | `cd frontend` → `npm run dev` |
| порт 4000 | порт 5173 (Vite) |

**Перевірка фронта — в браузері** (не PowerShell), крім очистки БД.

**Порядок важливий:** спочатку сторінки й API, **потім** C7 loading/error/empty (з правилами з REQUIREMENTS.md §6).

### Superpowers у новому чаті

Плагін може **не** підхопитись автоматично. На старті **кожного** нового Agent chat:

1. Перевір `.cursor/settings.json` — `superpowers.enabled: true`
2. Встав блок **C0** нижче (навіть якщо агент каже «не в REQUIREMENTS» — це в `AGENTS.md` і цьому гайді)
3. Модель: **composer-2.5-fast**

---

### C0. Контекст + Superpowers (перше повідомлення)

**Superpowers:** режим сесії (не відокремлений skill)

```
Superpowers mode + executing-plans:

Read AGENTS.md, REQUIREMENTS.md (section 6 UI states), STEP3-DRAFT-GUIDE.md phase C.

Frontend draft only. NO Docker yet.
Stack: Vite React+TypeScript, react-router-dom, plain CSS.
API: http://localhost:4000 via Vite proxy /api or VITE_API_URL.

One step at a time. Stop after each step for my browser verification.
Do NOT use brainstorming, TDD, parallel agents.

Confirm: 2 pages (/ and /courses/:id), loading/error/empty rules from REQUIREMENTS.md section 6.
Do not write code yet.
```

**Ти перевіряєш:** агент перелічив 2 сторінки і UI rules.

---

### C1. Vite scaffold + proxy

**Що з'явиться:**
```
frontend/
  package.json, vite.config.ts, index.html
  src/main.tsx, src/App.tsx (мінімальний)
```

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step C1 ONLY — Vite React+TypeScript in frontend/.

- npm create vite@latest style setup (react-ts)
- vite.config: proxy /api -> http://localhost:4000 (rewrite /api to backend paths)
- Or VITE_API_URL=http://localhost:4000 — pick one approach, document in comment
- react-router-dom dependency
- Plain src/index.css — container max-width, basic card/button styles only
- NO Tailwind. NO UI libraries. NO Docker.

Stop. List files and dev command.
verification-before-completion: npm run dev should open on 5173.
```

**Ти перевіряєш:**
```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft\frontend
npm install
npm run dev
```
Браузер: `http://localhost:5173` — сторінка відкривається (може бути placeholder).

---

### C2. types.ts + api.ts

**Що з'явиться:**
```
frontend/src/types.ts
frontend/src/api.ts   (fetch wrapper, ApiError class)
```

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step C2 ONLY.

Create types.ts — Course and Lesson types per REQUIREMENTS.md section 3.
Create api.ts:
- ApiError with status and message
- fetch wrapper reading JSON errors from { error: string }
- Functions: getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  getLessons, createLesson, updateLesson, deleteLesson

Use API_BASE from env or /api proxy. NO page components yet.
```

**Ти перевіряєш:** файли є, імпорти без червоних помилок у редакторі.

---

### C3. Routing + layout

**Що з'явиться:**
```
frontend/src/App.tsx — routes / and /courses/:id
frontend/src/pages/ — placeholder pages or empty shells
```

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step C3 ONLY.

Wire react-router-dom in App.tsx:
- / -> CoursesPage (can be minimal shell)
- /courses/:id -> CourseDetailsPage (minimal shell)

Add main layout in index.css. Pages show page title only for now.
NO full CRUD yet.
```

**Ти перевіряєш:** браузер `/` і `/courses/1` — різні заголовки, без 404 router.

---

### C4. CoursesPage — список, create, delete, progress

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step C4 ONLY — CoursesPage core features.

Implement CoursesPage:
- Load courses on mount
- CourseForm: create course (title, description)
- List: title, description, ProgressBar, link Open, Delete with confirm
- Optional: Edit course (PATCH) inline or modal — per REQUIREMENTS optional

Use ProgressBar component (gray outer, green inner width %).

Do NOT implement full error/empty state machine yet — basic loading text OK.
Read REQUIREMENTS.md section 6 for fields to show.
```

**Ти перевіряєш (бекенд + фронт running):**
1. `http://localhost:5173/` — створити курс
2. Курс у списку, progress 0%
3. Delete — курс зникає

---

### C5. CourseDetailsPage — уроки, checkbox, progress

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step C5 ONLY — CourseDetailsPage core.

Implement:
- Load course by id (GET /courses/:id with lessons embedded)
- ProgressBar at top
- LessonForm add lesson
- LessonList: checkbox isCompleted -> PATCH /lessons/:id
- Delete lesson, optional edit lesson title
- Link back to /

Components: LessonForm, LessonList, ProgressBar, reuse LoadingMessage if exists.

Basic loading only — full error UI in C7.
```

**Ти перевіряєш:**
1. Open course → add 2 lessons
2. Checkbox → progress changes
3. Delete lesson → progress updates

---

### C6. Optional edit (якщо ще не в C4/C5)

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step C6 ONLY — edit course title/description and lesson title if not done.

Minimal UI: Edit button toggles inline form. PATCH endpoints.
Stop if already implemented.
```

**Ти перевіряєш:** edit course name on list page, edit lesson title on details.

---

### C7. Loading, error, empty states (КРИТИЧНИЙ КРОК)

**Чому окремий крок:** без явних правил AI показує форму при мертвому бекенді, ховає empty state, пуста 404.

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step C7 ONLY — UI states per REQUIREMENTS.md section 6 "UI states — точні правила".

Implement EXACTLY:

CoursesPage:
- hasLoaded flag
- showForm ONLY when hasLoaded && !loadError && not editing
- loadError: ErrorMessage + Retry, NO create form
- empty: visible card "No courses yet" when hasLoaded && !loadError && courses.length===0
- actionError: separate from loadError; keep list visible if already loaded

CourseDetailsPage:
- loadError: "Course unavailable" heading + ErrorMessage + Retry + Back link — NOT blank page
- empty lessons: "No lessons yet" in LessonList

Reuse ErrorMessage, LoadingMessage components.
Do not change API or backend.
verification-before-completion: numbered browser test checklist.
```

**Ти перевіряєш (чекліст C7):**

| # | Дія | Очікування |
|---|---|---|
| 1 | Backend up → `Invoke-RestMethod http://localhost:4000/health` | ok |
| 2 | Stop backend → refresh `http://localhost:5173/` | Loading → **red error + Retry**, **NO** create form |
| 3 | Start backend → Retry | список знову |
| 4 | `Invoke-RestMethod http://localhost:4000/courses` → `[]` | порожній масив |
| 4b | Refresh `/` | форма + карточка **No courses yet** |
| 5 | Backend up, list loaded → stop backend → submit create | action error, list still visible |
| 6 | Open `/courses/99999` | Back + **Course unavailable** + message + Retry |
| 7 | Real course, 0 lessons | **No lessons yet** |

**Якщо крок 4 «нічого»:** у БД ще є курси — видали через UI або:
```powershell
Invoke-RestMethod http://localhost:4000/courses
# delete each via Invoke-RestMethod -Method DELETE ...
```

**Після змін:** hard refresh браузера (Ctrl+F5) — HMR інколи не все підхоплює.

---

### C8. Production build

**Superpowers:** verification-before-completion ✅

**Промпт:**
```
verification-before-completion: confirm frontend builds.

Tell me to run npm run build in frontend/. Fix only build errors, no new features.
```

**Ти:**
```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft\frontend
npm run build
```

**Зелений:** build completes without errors.

---

### C9. Закриття фази frontend

**Superpowers:** finishing-a-development-branch ✅

**Промпт:**
```
finishing-a-development-branch: frontend phase done.

Compare UI vs REQUIREMENTS.md section 6. List gaps.
Suggest git commit message. Do NOT start Docker yet.
```

**Ти:**
```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft
git add frontend/
git commit -m "feat(frontend): courses UI with loading and error states"
git push
```

---

## Фаза D — Docker Compose (детально)

**Ціль:** `docker compose up --build` → frontend :3000, backend :4000, postgres :5432.

**Перед D:** фази B і C зелені локально.

**Важливо:** у compose `DATABASE_URL` host = **`postgres`**, не `localhost`.

**Зупини** локальні `npm run dev` перед compose (порти 4000/5173/5432).

---

### D0. Superpowers блок (новий чат або продовження)

```
Superpowers mode + executing-plans:

Read AGENTS.md, REQUIREMENTS.md sections 7-8, STEP3-DRAFT-GUIDE.md phase D.

Implement Docker only. Do not change API logic unless required for container startup.
Backend JS (not TS). Prisma migrate on backend container start.
3 services: frontend, backend, postgres.
Ports: 3000, 4000, 5432.
One step at a time.
```

---

### D1. backend/Dockerfile + migrate on start

**Що з'явиться:**
```
backend/Dockerfile
backend/.dockerignore
```

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step D1 ONLY — backend Dockerfile.

- Node 20 alpine
- Copy package.json, prisma, src
- npm install (production or ci)
- prisma generate
- CMD: run prisma migrate deploy then node src/index.js
- EXPOSE 4000
- .dockerignore: node_modules

NO frontend Dockerfile yet. NO docker-compose.yml yet.
```

**Ти перевіряєш:** файли є, Dockerfile читається логічно.

---

### D2. frontend/Dockerfile

**Superpowers:** executing-plans ✅

**Промпт:**
```
executing-plans: Step D2 ONLY — frontend Dockerfile.

- Build stage: npm ci, npm run build
- Serve stage: nginx or node serve static from dist
- EXPOSE 3000 (map to 80 inside if nginx)
- frontend/.dockerignore

Configure nginx or env so API calls reach backend:4000 from browser
(production: may need VITE_API_URL at build time or nginx proxy /api).

NO docker-compose.yml yet.
```

**Ти перевіряєш:** Dockerfile + .dockerignore створені.

---

### D3. docker-compose.yml (3 сервіси)

**Superpowers:** executing-plans ✅ | verification-before-completion ✅

**Промпт:**
```
executing-plans: Step D3 ONLY — docker-compose.yml at project root.

Services:
- postgres:16, volume postgres_data, port 5432
- backend: build ./backend, port 4000, DATABASE_URL=postgresql://postgres:postgres@postgres:5432/courses_db
- frontend: build ./frontend, port 3000
- depends_on: backend waits postgres, frontend waits backend
- CORS already on backend for http://localhost:3000

Remove or keep docker-compose.dev.yml for local-only postgres — document in comment.

Stop. Do not run compose yet — give me the up command.
```

**Ти перевіряєш:** відкрий `docker-compose.yml` — 3 services, volume, правильний DATABASE_URL host `postgres`.

---

### D4. Запуск compose

**Superpowers:** verification-before-completion ✅

**Ти (не Cursor):**
```powershell
cd D:\ykarpovych\employment\Stellartech\course-progress-tracker-draft
docker compose down
docker compose up --build
```

**Ти перевіряєш:**
1. `http://localhost:3000` — UI
2. `Invoke-RestMethod http://localhost:4000/health` — ok
3. Сценарій §11: create course, lessons, progress, delete

**Типові помилки:**
- backend crash: migrate failed → postgres not ready → add healthcheck / retry
- CORS → додати `http://localhost:3000` на backend
- frontend API 404 → VITE_API_URL або proxy в nginx
- `DATABASE_URL` з localhost у backend container → змінити на postgres

**При помилці:** systematic-debugging + paste logs.

---

### D5. Persistence (дані живуть)

**Superpowers:** verification-before-completion ✅

**Ти:**
1. Створи курс у UI
2. `docker compose down`
3. `docker compose up` (без --build якщо не треба)
4. Курс на місці

**Відео:** цей крок хороший для демо «store permanently».

---

### D6. Закриття Docker

**Superpowers:** finishing-a-development-branch ✅

**Промпт:**
```
finishing-a-development-branch: Docker phase done.
Gaps vs REQUIREMENTS.md section 8. Commit message. README run instructions draft.
```

**Ти:**
```powershell
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml .dockerignore
git commit -m "chore(docker): compose for frontend, backend, and postgres"
git push
```

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
