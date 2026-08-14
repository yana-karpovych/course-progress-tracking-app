import cors from 'cors';
import express from 'express';
import coursesRouter from './routes/courses.js';

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/courses', coursesRouter);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
