import { Router } from 'express';
import { prisma } from '../prisma.js';
import { calculateProgress } from '../utils/progress.js';

const router = Router();

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function formatCourseWithProgress(course, includeLessons = false) {
  const lessons = course.lessons ?? [];
  const result = {
    id: course.id,
    title: course.title,
    description: course.description,
    createdAt: course.createdAt,
    totalLessons: lessons.length,
    completedLessons: lessons.filter((lesson) => lesson.isCompleted).length,
    progress: calculateProgress(lessons),
  };

  if (includeLessons) {
    result.lessons = lessons;
  }

  return result;
}

router.get('/', async (_req, res) => {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { lessons: true },
  });

  res.json(courses.map((course) => formatCourseWithProgress(course)));
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: { lessons: true },
  });

  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  res.json(formatCourseWithProgress(course, true));
});

router.post('/', async (req, res) => {
  const { title, description } = req.body;

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const course = await prisma.course.create({
    data: { title: title.trim(), description: description ?? '' },
  });

  res.status(201).json(course);
});

router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const { title, description } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const data = {};
  if (title !== undefined) {
    data.title = title.trim();
  }
  if (description !== undefined) {
    data.description = description;
  }

  const course = await prisma.course.update({
    where: { id },
    data,
  });

  res.json(course);
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: 'Course not found' });
  }

  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Course not found' });
  }

  await prisma.course.delete({ where: { id } });
  res.status(204).send();
});

export default router;
