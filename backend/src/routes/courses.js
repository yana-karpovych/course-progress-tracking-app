import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { prisma } from '../prisma.js';
import { formatCourseWithProgress } from '../utils/formatCourse.js';
import { normalizeDescription } from '../utils/normalizeDescription.js';
import { parseId } from '../utils/parseId.js';
import { getTitleValidationError } from '../utils/validateTitle.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: { lessons: true },
    });

    res.json(courses.map((course) => formatCourseWithProgress(course)));
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
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
  }),
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const titleError = getTitleValidationError(title);

    if (titleError) {
      return res.status(400).json({ error: titleError });
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: normalizeDescription(description),
      },
      include: { lessons: true },
    });

    res.status(201).json(formatCourseWithProgress(course));
  }),
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const { title, description } = req.body;
    const titleError = getTitleValidationError(title, { optional: true });

    if (titleError) {
      return res.status(400).json({ error: titleError });
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
      data.description = normalizeDescription(description);
    }

    const course = await prisma.course.update({
      where: { id },
      data,
      include: { lessons: true },
    });

    res.json(formatCourseWithProgress(course));
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
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
  }),
);

export default router;
