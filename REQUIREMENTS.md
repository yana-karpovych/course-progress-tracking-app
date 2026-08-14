# Course Progress Tracker — робочий документ виконання

> Внутрішній документ (не для здачі). Тут зафіксовано: що будую, чим, які ендпоінти,
> які правила, чого НЕ роблю, як демонструю і де ризики.
> На основі цього файлу складається бриф для Cursor і фінальний README.

---

## 1. Мета

Створити простий full-stack застосунок для відстеження прогресу проходження курсів.

Що оцінюють: базове розуміння full-stack — простий UI, API, база даних, Docker
і **вміння пояснити свій код**.

Орієнтовний час: ~1 година (це орієнтир обсягу, не жорсткий ліміт).
Це **не** продакшн-система. Ідеальність не потрібна, але й свідомо неякісно не робимо:
пишемо чисто, зрозуміло, у межах часу.

### Моя особиста мета

- Закрити **всі обов'язкові** вимоги.
- Закрити **всі optional** з ТЗ (edit course, edit lesson, `GET /courses/:id`).
- Додати мінімум того, що підвищує враження без роздування скоупу.
- Не додавати нічого, що суперечить «не будуй ідеальну продакшн-систему».

### Правило використання AI

- Cursor / ChatGPT / Claude **дозволені** для розробки — прямо написано в ТЗ.
- **Заборонено** підключати AI API *всередині* застосунку (жодних запитів до OpenAI/Claude
  з коду проєкту).
- Використання AI треба **описати** в README (розділ AI Usage Report).

---

## 2. Технологічний стек (рішення прийняте, не переглядається)

```txt
Backend:    Node.js + Express       (JavaScript, БЕЗ TypeScript)
Frontend:   React + TypeScript      (Vite)
Database:   PostgreSQL 16 + Prisma ORM
Docker:     Docker Compose, 3 сервіси — frontend, backend, postgres
Ports:      frontend 3000 / backend 4000 / postgres 5432
Стилі:      звичайний CSS, один файл (без Tailwind, без UI-бібліотек)
Роутинг:    react-router-dom, 2 сторінки
Прогрес:    рахується на БЕКЕНДІ і віддається разом з курсом
README:     англійською
```

### Чому саме так (щоб могла пояснити на відео)

| Рішення | Обґрунтування |
|---|---|
| Node + Express | Найпростіший спосіб зробити REST API; трек вакансії — Node.js + React |
| JS на бекенді, а не TS | TypeScript вимагає крок компіляції, який треба вписати в Dockerfile — зайвий ризик; виграш на 9 простих ендпоінтах мінімальний |
| TS на фронтенді | Vite дає готовий шаблон без налаштування; типи `Course`/`Lesson` реально ловлять помилки |
| PostgreSQL, а не SQLite | Preferred у ТЗ; піднімається одним рядком у Docker |
| Prisma | Схема описується людською мовою, міграції генеруються самі, є автодоповнення |
| Прогрес на бекенді | Бізнес-логіка має жити на сервері; фронтенд лише відображає |
| Frontend теж у Docker | У ТЗ це «bonus, but recommended» — беремо як плюс |

---

## 3. Модель даних

### Типи на фронтенді

```ts
type Course = {
  id: number;
  title: string;
  description: string;   // може бути порожнім рядком
  createdAt: string;     // НЕ опційне: база заповнює завжди
  // додатково приходить з бекенду:
  totalLessons?: number;
  completedLessons?: number;
  progress?: number;     // 0..100
};

type Lesson = {
  id: number;
  courseId: number;
  title: string;
  isCompleted: boolean;
  description?: string;  // єдине справді опційне поле (optional у ТЗ)
  createdAt: string;
};
```

Правило: `?` ставиться **перед** двокрапкою і означає «поле може бути відсутнім».
`createdAt` опційним НЕ є.

### Схема Prisma

```prisma
model Course {
  id          Int      @id @default(autoincrement())
  title       String
  description String   @default("")
  createdAt   DateTime @default(now())
  lessons     Lesson[]
}

model Lesson {
  id          Int      @id @default(autoincrement())
  courseId    Int
  title       String
  isCompleted Boolean  @default(false)
  description String?
  createdAt   DateTime @default(now())
  course      Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
}
```

Створення таблиць:

```bash
npx prisma migrate dev --name init
```

Prisma сама генерує SQL і створює таблиці — руками SQL не пишемо.

### Що означає зв'язок «one course -> many lessons»

Три конкретні наслідки:

1. **У базі** — у таблиці `lessons` є колонка `course_id`, що посилається на `courses.id`
   (foreign key). База не дасть створити урок з посиланням на неіснуючий курс.
2. **В API** — з'являються вкладені маршрути: `/courses/5/lessons` = «уроки курсу №5».
3. **В UI** — уроки не існують самі по собі; завжди дивимо уроки конкретного курсу.

`onDelete: Cascade` означає: при видаленні курсу база **автоматично** видаляє всі його
уроки. Без цього видалення курсу з уроками поверне помилку.

Еквівалент чистим SQL (щоб розуміти, що робить Prisma):

```sql
CREATE TABLE lessons (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMP NOT NULL DEFAULT now()
);
```

### Назви полів: camelCase vs snake_case

ТЗ рекомендує в базі `created_at`, `is_completed`, `course_id`, а в API — `createdAt`,
`isCompleted`, `courseId`. Prisma за замовчуванням робить camelCase і там, і там — це
**прийнятно**. За бажанням точної відповідності додається `@map("created_at")`, але це
не обов'язково.

---

## 4. Логіка прогресу

```txt
progress = completed lessons / total lessons * 100
```

Контрольні приклади з ТЗ:

```txt
0 / 0 = 0%     <- окремий випадок, інакше буде NaN
1 / 4 = 25%
2 / 4 = 50%
4 / 4 = 100%
```

Реалізація (на бекенді):

```js
function calculateProgress(lessons) {
  if (lessons.length === 0) return 0;              // без цього рядка буде NaN
  const completed = lessons.filter(lesson => lesson.isCompleted).length;
  return Math.round((completed / lessons.length) * 100);
}
```

Важливо:

- Це **ділення**, не множення.
- Масив уроків **один**. `total` — його довжина, `completed` — результат фільтрації.
  Немає двох окремих масивів.
- Перевірка на нуль обов'язкова — випадок `0/0` явно вказаний у ТЗ, отже його перевірять.

---

## 5. API — детальна специфікація

Base URL: `http://localhost:4000`. Формат обміну: JSON.

### Що означає «створити endpoint»

Endpoint — це функція, яка виконується, коли на певну адресу приходить певний тип запиту.

```js
import express from 'express';
const app = express();

app.use(express.json());   // щоб сервер розумів JSON у тілі запиту

app.get('/courses', async (request, response) => {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
  response.json(courses);
});

app.listen(4000, () => console.log('Server started on port 4000'));
```

- `app.get` — метод HTTP: `get` (отримати), `post` (створити), `patch` (частково змінити),
  `delete` (видалити).
- `'/courses'` — адреса.
- `request` — що прийшло: `request.params` (зі шляху), `request.body` (тіло запиту).
- `response` — чим відповідаємо: `response.json(...)`, `response.status(...)`.
- `:id` у шляху означає змінну частину; читається як `request.params.id`.

### Коди відповідей

| Код | Значення | Де застосовується |
|---|---|---|
| 200 | OK | успішні GET і PATCH |
| 201 | Created | успішний POST |
| 204 | No Content | успішний DELETE |
| 400 | Bad Request | не пройшла валідація |
| 404 | Not Found | немає такого курсу/уроку |
| 500 | Server Error | неочікувана помилка |

### Курси

```txt
GET /courses
  Що робить:  віддає список усіх курсів
  Приймає:    нічого
  Повертає:   200 + масив курсів; кожен курс містить totalLessons,
              completedLessons і progress
```

```txt
GET /courses/:id                                   [optional у ТЗ — робимо]
  Що робить:  віддає один курс разом з його уроками і прогресом
  Приймає:    id у шляху
  Перевіряє:  курс існує
  Повертає:   200 + курс з масивом lessons; або 404
```

```txt
POST /courses
  Що робить:  створює новий курс
  Приймає:    { title, description }
  Перевіряє:  title — рядок і не порожній після trim
  Повертає:   201 + створений курс; або 400 { error }
```

```txt
PATCH /courses/:id                                 [optional у ТЗ — робимо]
  Що робить:  змінює title та/або description курсу
  Приймає:    { title?, description? }
  Перевіряє:  курс існує; якщо title передано — рядок і не порожній
  Повертає:   200 + оновлений курс; або 400 / 404
```

```txt
DELETE /courses/:id
  Що робить:  видаляє курс разом з усіма його уроками (каскадно)
  Приймає:    id у шляху
  Перевіряє:  курс існує
  Повертає:   204 без тіла; або 404
```

### Уроки

```txt
GET /courses/:courseId/lessons
  Що робить:  віддає всі уроки конкретного курсу
  Приймає:    courseId у шляху
  Перевіряє:  курс існує
  Повертає:   200 + масив уроків; або 404
```

```txt
POST /courses/:courseId/lessons
  Що робить:  додає урок до курсу
  Приймає:    { title, description? }
  Перевіряє:  курс існує; title — рядок і не порожній
  Повертає:   201 + створений урок; або 400 / 404
```

```txt
PATCH /lessons/:id
  Що робить:  відмічає урок виконаним/невиконаним і/або змінює title
  Приймає:    { isCompleted?, title?, description? }
  Перевіряє:  урок існує; якщо isCompleted передано — це саме boolean;
              якщо title передано — рядок і не порожній
  Повертає:   200 + оновлений урок; або 400 / 404
```

```txt
DELETE /lessons/:id
  Що робить:  видаляє урок
  Приймає:    id у шляху
  Перевіряє:  урок існує
  Повертає:   204 без тіла; або 404
```

### Валідація у коді

Перевірки стоять **на початку** функції-ендпоінта, до звернення до бази. Якщо дані погані —
відповідаємо помилкою і **виходимо через `return`**.

```js
app.post('/courses', async (request, response) => {
  const { title, description } = request.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return response.status(400).json({ error: 'Title is required' });
  }

  const course = await prisma.course.create({
    data: { title: title.trim(), description: description ?? '' },
  });
  response.status(201).json(course);
});
```

Перевірка boolean і існування сутності:

```js
app.patch('/lessons/:id', async (request, response) => {
  const id = Number(request.params.id);
  const { isCompleted } = request.body;

  if (typeof isCompleted !== 'boolean') {
    return response.status(400).json({ error: 'isCompleted must be a boolean' });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return response.status(404).json({ error: 'Lesson not found' });
  }

  const updated = await prisma.lesson.update({ where: { id }, data: { isCompleted } });
  response.json(updated);
});
```

**Найчастіша помилка:** забути `return` перед `response.status(400)` — тоді функція
продовжить виконання попри помилку.

**Чому потрібна перевірка `typeof isCompleted !== 'boolean'`:** з фронтенду може прийти
рядок `"true"` замість `true`, і без перевірки в базу потрапить сміття.

### Чекліст валідації з ТЗ

- [ ] `course.title` обов'язковий
- [ ] `lesson.title` обов'язковий
- [ ] `isCompleted` мусить бути boolean
- [ ] урок мусить належати наявному курсу
- [ ] неіснуючий `id` -> 404, а не падіння сервера
- [ ] нечисловий `id` у шляху не ламає сервер

---

## 6. Frontend

### Дві сторінки

**Сторінка 1 — `/` — список курсів**

- форма створення курсу (title, description)
- список курсів; для кожного: назва, прогрес, «відкрити», «редагувати», «видалити»
- стан завантаження і стан помилки

**Сторінка 2 — `/courses/:id` — деталі курсу**

- назва і опис курсу
- прогрес-бар + текст `X%` і `completed / total`
- форма додавання уроку
- список уроків; для кожного: чекбокс, назва, «редагувати», «видалити»
- посилання назад до списку
- стан завантаження і стан помилки

Формально ТЗ допускає й один екран («course details **area** or page»), але дві сторінки
зрозуміліші й краще виглядають на відео.

### Дизайн — швидко і просто

Один файл `index.css`, звичайний CSS: обмежена ширина контейнера, відступи, рамки на
картках, кнопки нормального розміру.

Прогрес-бар — два `div`: зовнішній сірий, внутрішній зелений з `width: ${progress}%`.

**Tailwind і UI-бібліотеки не беремо** — налаштування з'їдає час, на оцінку не впливає.

### Loading і error — обов'язкові

ТЗ прямо вимагає «basic loading or error message». Мінімум:

- поки запит іде — `Loading...`
- якщо запит упав — текст помилки і можливість повторити
- порожній список — «No courses yet»

### UI states — точні правила (читай Cursor перед C7)

Ці правила **не в оригінальному ТЗ**, але без них AI часто робить «форму при мертвому бекенді» або «пусту 404».

**Сторінка курсів `/`**

| Стан | Що показувати |
|---|---|
| `loading` (перший load) | `Loading...`, **без** форми створення |
| `loadError` (бекенд down / network) | червона помилка + **Retry**, **без** форми «New course» |
| `hasLoaded && !loadError && courses.length === 0` | форма створення + **видима** карточка `No courses yet` |
| `hasLoaded && courses.length > 0` | форма + список курсів |
| `actionError` (create/update/delete failed) | помилка + Retry; **список залишається**, якщо був загружен; Retry **очищає** action error і перезагружає дані |

Технічно: `showForm = hasLoaded && !loadError && not editing`.

**Сторінка курсу `/courses/:id`**

| Стан | Що показувати |
|---|---|
| `loading` | `Loading...` |
| `loadError` (404 або network) | `← Back`, заголовок **Course unavailable**, текст помилки, **Retry** — **не** пуста сторінка |
| `course loaded, lessons.length === 0` | `No lessons yet` |
| `actionError` | помилка; дані курсу залишаються на екрані |

**Dev:** фронт `http://localhost:5173` (Vite), API `http://localhost:4000`. Vite proxy `/api` → `4000` або `VITE_API_URL`.

**Перевірка фронта — в браузері**, не PowerShell (крім очистки БД).

## 7. База даних

### Що означає «store permanently»

Дані мусять вижити після перезапуску. Так робити **не можна**:

```js
const courses = [];   // при перезапуску сервера все зникне
```

Дані живуть у PostgreSQL. Через Docker є нюанс: контейнер із базою можна видалити разом
з даними, тому в compose додається **volume**:

```yaml
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Перевірка (варто показати на відео):** створити курс -> `docker compose down` ->
`docker compose up` -> курс на місці.

### Розбір DATABASE_URL

```txt
postgresql://postgres:postgres@postgres:5432/courses_db
```

| Частина | Значення |
|---|---|
| `postgresql://` | тип бази |
| перший `postgres` | користувач |
| другий `postgres` | пароль |
| **третій `postgres`** | **хост** (найпідступніше місце) |
| `5432` | порт |
| `courses_db` | назва бази |

Чому хост — `postgres`, а не `localhost`: у Docker Compose сервіси бачать одне одного
**за іменами сервісів із compose-файлу**. Для бекенду всередині контейнера `localhost` —
це він сам, а не база.

Два варіанти, які треба тримати окремо:

```txt
Бекенд у Docker:   postgresql://postgres:postgres@postgres:5432/courses_db
Бекенд локально:   postgresql://postgres:postgres@localhost:5432/courses_db
```

Це **найчастіша** причина помилки «не можу підключитись до бази».

---

## 8. Docker

Запуск однією командою:

```bash
docker compose up --build
```

Сервіси:

```txt
frontend  -> 3000   (bonus у ТЗ, робимо)
backend   -> 4000   (обов'язково)
postgres  -> 5432   (обов'язково)
```

Що потрібно зробити:

- [ ] `backend/Dockerfile`
- [ ] `frontend/Dockerfile`
- [ ] `docker-compose.yml` з трьома сервісами
- [ ] volume для збереження даних Postgres
- [ ] `depends_on` для порядку старту
- [ ] застосування Prisma-міграцій при старті бекенду
- [ ] `.dockerignore` (щоб `node_modules` не потрапляв в образ)
- [ ] `.env.example`, а справжній `.env` — у `.gitignore`

Окремо не забути: **CORS** на бекенді, бо фронтенд на порту 3000 звертається до бекенду
на 4000 — це різні origin, і без CORS браузер заблокує запити.

---

## 9. Структура проєкту

```txt
course-progress-tracker/
  backend/
    src/
      index.js          # запуск сервера, middleware
      routes/           # ендпоінти курсів і уроків
    prisma/
      schema.prisma
      migrations/
    Dockerfile
    package.json
  frontend/
    src/
      pages/            # CoursesPage, CourseDetailsPage
      components/       # CourseForm, LessonList, ProgressBar
      api.ts            # запити до бекенду в одному місці
      types.ts          # Course, Lesson
      index.css
    Dockerfile
    package.json
  docker-compose.yml
  README.md
  .gitignore
```

---

## 10. Обсяг: що робимо і чого НЕ робимо

### Обов'язково (з ТЗ)

- [ ] Перегляд списку курсів
- [ ] Створення курсу
- [ ] Видалення курсу
- [ ] Додавання уроку до курсу
- [ ] Відмітка уроку виконаним / невиконаним
- [ ] **Видалення уроку** — див. примітку нижче
- [ ] Відображення відсотка прогресу
- [ ] 7 обов'язкових ендпоінтів
- [ ] Валідація з ТЗ
- [ ] Дві таблиці зі зв'язком, дані зберігаються постійно
- [ ] `docker compose up --build` піднімає backend + database
- [ ] Loading / error у UI
- [ ] README з усіма розділами + AI Usage Report

> **Примітка про видалення уроку.** У списку «required features» його забули, але воно є
> в ендпоінтах (`DELETE /lessons/:id`), у завданнях фронтенду («Delete lesson button») і
> в пунктах відео. Отже — **обов'язкове**.

### Optional з ТЗ — робимо всі (тільки ПІСЛЯ того, як обов'язкове працює)

- [ ] `GET /courses/:id`
- [ ] `PATCH /courses/:id` + форма редагування курсу
- [ ] Редагування назви уроку (розширений `PATCH /lessons/:id`)

### Додатково, дешево і додає враження

- [ ] Frontend у Docker (третій сервіс)
- [ ] Прогрес рахується на бекенді
- [ ] README англійською
- [ ] Акуратні коміти по етапах
- [ ] Чесний і конкретний AI Usage Report

### НЕ робимо (свідоме рішення)

- авторизація, користувачі, ролі
- пагінація, пошук, фільтри, сортування
- тести (1–2 символічні лише за наявності запасу часу — не пріоритет)
- CI/CD, GitHub Actions
- Tailwind, UI-бібліотеки, темна тема, анімації
- оптимістичні оновлення, кешування, React Query
- мікросервіси, складна архітектура, шари абстракцій
- **будь-який AI API всередині застосунку** (прямо заборонено в ТЗ)
- деплой на хостинг

Причина: ТЗ прямо просить не будувати ідеальну продакшн-систему; кожен пункт вище
збільшує ризик не здати вчасно і не додає бали.

---

## 11. Сценарій демо (він же чекліст перевірки)

Перевіряю цей шлях у чернетці, потім показую на відео:

1. `docker compose up --build` — усе піднялось без помилок
2. Відкриваю `http://localhost:3000` — порожній список і повідомлення
3. Створюю курс «JavaScript Basics» з описом
4. Курс у списку, прогрес `0%` (перевірка випадку `0/0`)
5. Відкриваю курс — сторінка деталей
6. Додаю 4 уроки
7. Відмічаю 1-й -> прогрес `25%`
8. Відмічаю 2-й -> прогрес `50%`
9. Знімаю галочку з 2-го -> прогрес знову `25%`
10. Редагую назву курсу -> зміна відображається
11. Видаляю один урок -> прогрес перерахувався
12. Повертаюсь до списку курсів -> прогрес видно і там
13. Пробую створити курс з порожньою назвою -> бачу помилку валідації
14. `docker compose down` -> `docker compose up` -> дані на місці
15. Видаляю курс -> зник разом з уроками

---

## 12. Ризики (де найімовірніше застрягну)

| Ризик | Прояв | Що робити |
|---|---|---|
| `DATABASE_URL` / хост | «не можу підключитись до бази» | всередині Docker хост — `postgres`, локально — `localhost` |
| Порядок старту сервісів | бекенд стартує раніше за базу | `depends_on`, healthcheck, повторна спроба підключення |
| Prisma-міграції в контейнері | таблиць немає при першому запуску | застосовувати міграції в команді старту бекенду |
| CORS | запити з 3000 на 4000 блокуються браузером | увімкнути CORS на бекенді |
| `0/0 = NaN` | в UI показує `NaN%` | перевірка на нуль у формулі |
| Каскадне видалення | помилка при видаленні курсу з уроками | `onDelete: Cascade` у схемі |
| Зайняті порти на Windows | контейнер не стартує | перевірити 3000 / 4000 / 5432 заздалегідь |
| Docker Desktop / WSL2 | збірка не працює взагалі | перевірено через `docker run hello-world` |
| Тип `id` зі шляху | `request.params.id` — рядок, не число | `Number(...)` + перевірка на `NaN` |

---

## 13. Пункти відео (вимога ТЗ)

Записую шматками, монтую в кінці:

1. Project setup
2. AI usage
3. Backend implementation
4. Database setup
5. Frontend implementation
6. Docker setup
7. Running the project
8. Creating a course
9. Adding lessons
10. Marking a lesson as completed
11. Showing progress change
12. Deleting a course or lesson
13. Short explanation of the project structure

Що мушу вміти пояснити своїми словами:

- чому такий стек і чому JS на бекенді, а TS на фронтенді
- що таке зв'язок «один до багатьох» і де він у коді
- як рахується прогрес і чому є перевірка на нуль
- що робить кожен сервіс у `docker-compose.yml`
- чому хост у `DATABASE_URL` — `postgres`, а не `localhost`
- де саме допоміг AI і що я перевіряла та правила сама

---

## 14. Що подати на здачу

- [ ] Посилання на публічний Git-репозиторій
- [ ] Посилання на відео (або файл)
- [ ] Коротка нотатка, якщо щось не працює
- [ ] README англійською з розділами: how to run, technologies, API endpoints,
      database description, Docker description, what is completed,
      what is not completed, how AI was used
- [ ] Розділ AI Usage Report: інструмент, для чого використовувала,
      2–3 приклади промптів, що правила руками, що було складно
