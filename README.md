# Course Progress Tracker

**Live Demo:** [Open application](https://course-progress-tracking-app.vercel.app/)  
**GitHub:** [View source code](https://github.com/yana-karpovych/course-progress-tracking-app)

Course Progress Tracker is a full-stack React + TypeScript application for managing courses and tracking lesson completion.

The application allows users to create, edit, and delete courses and lessons, mark lessons as complete, and view progress calculated on the backend. It interacts with a REST API backed by PostgreSQL, demonstrating asynchronous requests, state management, and modern full-stack development practices.

## Technologies Used

### Core

- React
- TypeScript
- Vite
- Node.js
- Express

### State Management

- React Hooks

### Styling

- CSS

### Data / API

- REST API
- Fetch API
- Prisma ORM
- PostgreSQL

### Infrastructure

- Docker
- Docker Compose
- nginx
- Neon
- Render
- Vercel

### Development & Tooling

- react-router-dom
- Oxlint

## Getting Started

### Live Demo

The application is deployed and available online:

[Open application](https://course-progress-tracking-app.vercel.app/)

### Run Locally

### Clone the repository

```bash
git clone https://github.com/yana-karpovych/course-progress-tracking-app.git
cd course-progress-tracking-app
```

### Run with Docker

```bash
docker compose down
docker compose up --build
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:4000 |
| Postgres | localhost:5432 |

The app will be available at: http://localhost:3000

Stop containers:

```bash
docker compose down
```

Data persists in the `postgres_data` Docker volume.

## Features

### Course Management

- Create new courses
- Edit existing courses
- Delete courses
- View course list with progress summary

### Lesson Management

- Add lessons to a course
- Edit lesson title and description
- Delete lessons
- Toggle lesson completion status

### Progress Tracking

- Progress calculated on the backend
- Real-time progress updates in the UI
- Handles edge case: 0 lessons = 0% progress

### User Experience

- Two-page navigation (course list and course details)
- Loading indicators during API requests
- Error handling and validation messages
- Responsive layout

### API

- `GET /courses` — list courses with progress
- `GET /courses/:id` — course details with lessons
- `POST /courses` — create course
- `PATCH /courses/:id` — update course
- `DELETE /courses/:id` — delete course and lessons
- `GET /courses/:courseId/lessons` — list lessons
- `POST /courses/:courseId/lessons` — create lesson
- `PATCH /lessons/:id` — update lesson
- `DELETE /lessons/:id` — delete lesson
