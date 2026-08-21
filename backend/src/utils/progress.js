export function getLessonStats(lessons) {
  const total = lessons.length;

  if (total === 0) {
    return { completed: 0, total: 0, progress: 0 };
  }

  const completed = lessons.filter((lesson) => lesson.isCompleted).length;

  return {
    completed,
    total,
    progress: Math.round((completed / total) * 100),
  };
}
