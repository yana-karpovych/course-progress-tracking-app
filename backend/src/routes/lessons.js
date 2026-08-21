import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../prisma.js';
import { normalizeDescription } from '../utils/normalizeDescription.js';
import { parseId } from '../utils/parseId.js';
import { getTitleValidationError } from '../utils/validateTitle.js';

const courseLessonsRouter = Router({ mergeParams: true });

courseLessonsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const courseId = parseId(req.params.courseId);
    if (courseId === null) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' },
    });

    res.json(lessons);
  }),
);

courseLessonsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const courseId = parseId(req.params.courseId);
    if (courseId === null) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { title, description } = req.body;
    const titleError = getTitleValidationError(title);

    if (titleError) {
      return res.status(400).json({ error: titleError });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title: title.trim(),
        description: normalizeDescription(description),
      },
    });

    res.status(201).json(lesson);
  }),
);

const lessonsRouter = Router();

lessonsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const { isCompleted, title, description } = req.body;

    if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
      return res.status(400).json({ error: 'isCompleted must be a boolean' });
    }

    const titleError = getTitleValidationError(title, { optional: true });
    if (titleError) {
      return res.status(400).json({ error: titleError });
    }

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const data = {};
    if (isCompleted !== undefined) {
      data.isCompleted = isCompleted;
    }
    if (title !== undefined) {
      data.title = title.trim();
    }
    if (description !== undefined) {
      data.description = normalizeDescription(description);
    }

    const lesson = await prisma.lesson.update({
      where: { id },
      data,
    });

    res.json(lesson);
  }),
);

lessonsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const existing = await prisma.lesson.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await prisma.lesson.delete({ where: { id } });
    res.status(204).send();
  }),
);

export { courseLessonsRouter, lessonsRouter };
