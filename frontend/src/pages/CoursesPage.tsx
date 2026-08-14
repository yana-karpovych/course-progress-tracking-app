import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ApiError,
  createCourse,
  deleteCourse,
  getCourses,
  updateCourse,
} from '../api'
import CourseForm from '../components/CourseForm'
import ErrorMessage from '../components/ErrorMessage'
import LoadingMessage from '../components/LoadingMessage'
import ProgressBar from '../components/ProgressBar'
import type { Course } from '../types'

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadCourses = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true)
    }
    setLoadError(null)

    try {
      const data = await getCourses()
      setCourses(data)
      setHasLoaded(true)
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to load courses'
      setLoadError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses(true)
  }, [loadCourses])

  async function handleCreate(data: { title: string; description: string }) {
    setSubmitting(true)
    setActionError(null)

    try {
      await createCourse(data)
      await loadCourses()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to create course'
      setActionError(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(
    id: number,
    data: { title: string; description: string },
  ) {
    setSavingId(id)
    setActionError(null)

    try {
      await updateCourse(id, data)
      setEditingId(null)
      await loadCourses()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to update course'
      setActionError(message)
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this course and all its lessons?')) {
      return
    }

    setDeletingId(id)
    setActionError(null)

    try {
      await deleteCourse(id)
      await loadCourses()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to delete course'
      setActionError(message)
    } finally {
      setDeletingId(null)
    }
  }

  const showForm = hasLoaded && !loadError && editingId === null
  const showEmptyState = hasLoaded && !loadError && courses.length === 0

  return (
    <main>
      <h1>Courses</h1>

      {loading && <LoadingMessage />}

      {loadError && (
        <ErrorMessage message={loadError} onRetry={() => loadCourses(true)} />
      )}

      {showForm && (
        <CourseForm onSubmit={handleCreate} submitting={submitting} />
      )}

      {actionError && (
        <ErrorMessage
          message={actionError}
          onRetry={() => {
            setActionError(null)
            loadCourses()
          }}
        />
      )}

      {showEmptyState && (
        <div className="card empty-state">No courses yet</div>
      )}

      {hasLoaded && courses.length > 0 && (
        <ul className="course-list">
          {courses.map((course) => (
            <li key={course.id} className="card">
              {editingId === course.id ? (
                <CourseForm
                  initialTitle={course.title}
                  initialDescription={course.description}
                  heading="Edit course"
                  submitLabel="Save"
                  submittingLabel="Saving..."
                  submitting={savingId === course.id}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(data) => handleUpdate(course.id, data)}
                />
              ) : (
                <>
                  <h2>{course.title}</h2>
                  {course.description && <p>{course.description}</p>}
                  <ProgressBar
                    progress={course.progress ?? 0}
                    completed={course.completedLessons ?? 0}
                    total={course.totalLessons ?? 0}
                  />
                  <div className="actions">
                    <Link to={`/courses/${course.id}`}>Open</Link>
                    <button type="button" onClick={() => setEditingId(course.id)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course.id)}
                      disabled={deletingId === course.id}
                    >
                      {deletingId === course.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default CoursesPage
