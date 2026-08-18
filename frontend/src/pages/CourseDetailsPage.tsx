import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ApiError,
  createLesson,
  deleteLesson,
  getCourse,
  updateLesson,
} from '../api'
import ErrorMessage from '../components/ErrorMessage'
import LessonForm from '../components/LessonForm'
import LessonList from '../components/LessonList'
import LoadingMessage from '../components/LoadingMessage'
import ProgressBar from '../components/ProgressBar'
import type { Course, Lesson } from '../types'

function CourseDetailsPage() {
  const { id } = useParams()
  const courseId = Number(id)

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadCourse = useCallback(
    async (showLoading = false) => {
      if (!Number.isInteger(courseId) || courseId <= 0) {
        setLoadError('Invalid course id')
        setCourse(null)
        setLoading(false)
        return
      }

      if (showLoading) {
        setLoading(true)
      }
      setLoadError(null)

      try {
        const data = await getCourse(courseId)
        setCourse(data)
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : 'Failed to load course'
        setLoadError(message)
        setCourse(null)
      } finally {
        setLoading(false)
      }
    },
    [courseId],
  )

  useEffect(() => {
    loadCourse(true)
  }, [loadCourse])

  async function handleCreateLesson(data: {
    title: string
    description: string
  }) {
    setSubmitting(true)
    setActionError(null)

    try {
      await createLesson(courseId, data)
      await loadCourse()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to add lesson'
      setActionError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveLessonEdit(
    lessonId: number,
    data: { title: string; description: string },
  ) {
    setSavingId(lessonId)
    setActionError(null)

    try {
      await updateLesson(lessonId, {
        title: data.title,
        description: data.description,
      })
      setEditingLessonId(null)
      await loadCourse()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update lesson'
      setActionError(message)
    } finally {
      setSavingId(null)
    }
  }

  async function handleToggleComplete(lesson: Lesson, isCompleted: boolean) {
    setUpdatingId(lesson.id)
    setActionError(null)

    try {
      await updateLesson(lesson.id, { isCompleted })
      await loadCourse()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update lesson'
      setActionError(message)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDeleteLesson(lessonId: number) {
    if (!window.confirm('Delete this lesson?')) {
      return
    }

    setDeletingId(lessonId)
    setActionError(null)

    try {
      await deleteLesson(lessonId)
      await loadCourse()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete lesson'
      setActionError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const lessons = course?.lessons ?? []
  const canRetryLoad = Number.isInteger(courseId) && courseId > 0

  return (
    <main>
      <p>
        <Link to="/">← Back to courses</Link>
      </p>

      {loading && <LoadingMessage />}

      {!loading && loadError && (
        <>
          <h1>Course unavailable</h1>
          <ErrorMessage
            message={loadError}
            onRetry={canRetryLoad ? () => loadCourse(true) : undefined}
          />
        </>
      )}

      {!loading && course && (
        <>
          <section className="card course-overview">
            <h1>{course.title}</h1>
            {course.description && (
              <p className="course-description">{course.description}</p>
            )}

            <ProgressBar
              progress={course.progress ?? 0}
              completed={course.completedLessons ?? 0}
              total={course.totalLessons ?? 0}
            />
          </section>

          {actionError && (
            <ErrorMessage
              message={actionError}
              onRetry={() => {
                setActionError(null)
                loadCourse()
              }}
            />
          )}

          <section className="section-block lessons-section">
            <h2 className="section-title">Lessons</h2>
            <p className="section-hint">
              Add lessons below, then check them off as you complete each one.
            </p>

            <div className="lessons-panel card">
              {editingLessonId === null && (
                <LessonForm
                  embedded
                  onSubmit={handleCreateLesson}
                  submitting={submitting}
                />
              )}

              <LessonList
                lessons={lessons}
                editingId={editingLessonId}
                updatingId={updatingId}
                savingId={savingId}
                deletingId={deletingId}
                onStartEdit={setEditingLessonId}
                onCancelEdit={() => setEditingLessonId(null)}
                onSaveEdit={handleSaveLessonEdit}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteLesson}
              />
            </div>
          </section>
        </>
      )}
    </main>
  )
}

export default CourseDetailsPage
