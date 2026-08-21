import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import coursesRouter from './routes/courses.js';
import { courseLessonsRouter, lessonsRouter } from './routes/lessons.js';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/courses', coursesRouter);
app.use('/courses/:courseId/lessons', courseLessonsRouter);
app.use('/lessons', lessonsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
