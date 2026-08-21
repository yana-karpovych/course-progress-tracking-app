import { getLessonStats } from './progress.js';

export function formatCourseWithProgress(course, includeLessons = false) {
  const lessons = course.lessons ?? [];
  const { completed, total, progress } = getLessonStats(lessons);

  const result = {
    id: course.id,
    title: course.title,
    description: course.description,
    createdAt: course.createdAt,
    totalLessons: total,
    completedLessons: completed,
    progress,
  };

  if (includeLessons) {
    result.lessons = lessons;
  }

  return result;
}
