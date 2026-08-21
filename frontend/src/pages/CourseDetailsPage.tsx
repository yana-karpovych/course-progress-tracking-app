import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  createLesson,
  deleteLesson,
  getCourse,
  updateLesson,
} from '../api'
import ConfirmDialog from '../components/ConfirmDialog'
import EntityForm from '../components/EntityForm'
import ErrorMessage from '../components/ErrorMessage'
import LessonList from '../components/LessonList'
import LoadingMessage from '../components/LoadingMessage'
import ProgressBar from '../components/ProgressBar'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useConfirm } from '../hooks/useConfirm'
import { getPendingId } from '../hooks/getPendingId'
import { useResourceLoader } from '../hooks/useResourceLoader'
import type { Lesson } from '../types'

function CourseDetailsPage() {
  const { id } = useParams()
  const courseId = Number(id)

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null)

  const validateCourseId = useCallback(() => {
    if (!Number.isInteger(courseId) || courseId <= 0) {
      return 'Invalid course id'
    }
    return null
  }, [courseId])

  const loadCourse = useCallback(() => getCourse(courseId), [courseId])

  const {
    data: course,
    loading,
    error: loadError,
    load,
  } = useResourceLoader(loadCourse, {
    errorFallback: 'Failed to load course',
    validate: validateCourseId,
  })

  const { actionError, setActionError, run, isPending, pendingKey } =
    useAsyncAction('Request failed')
  const { requestConfirm, confirmRequest, handleConfirm, handleCancel } =
    useConfirm()

  async function handleCreateLesson(data: {
    title: string
    description: string
  }) {
    await run(() => createLesson(courseId, data), {
      key: 'create',
      errorFallback: 'Failed to add lesson',
      onSuccess: () => load(),
    })
  }

  async function handleSaveLessonEdit(
    lessonId: number,
    data: { title: string; description: string },
  ) {
    await run(
      () =>
        updateLesson(lessonId, {
          title: data.title,
          description: data.description,
        }),
      {
        key: `save-${lessonId}`,
        errorFallback: 'Failed to update lesson',
        onSuccess: () => {
          setEditingLessonId(null)
          return load()
        },
      },
    )
  }

  async function handleToggleComplete(lesson: Lesson, isCompleted: boolean) {
    await run(() => updateLesson(lesson.id, { isCompleted }), {
      key: `toggle-${lesson.id}`,
      errorFallback: 'Failed to update lesson',
      onSuccess: () => load(),
    })
  }

  async function handleDeleteLesson(lessonId: number) {
    const confirmed = await requestConfirm('Delete this lesson?')
    if (!confirmed) {
      return
    }

    await run(() => deleteLesson(lessonId), {
      key: `delete-${lessonId}`,
      errorFallback: 'Failed to delete lesson',
      onSuccess: () => load(),
    })
  }

  const lessons = course?.lessons ?? []
  const canRetryLoad = Number.isInteger(courseId) && courseId > 0

  return (
    <main>
      {confirmRequest && (
        <ConfirmDialog
          message={confirmRequest.message}
          confirmLabel={confirmRequest.confirmLabel}
          cancelLabel={confirmRequest.cancelLabel}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <p>
        <Link to="/">← Back to courses</Link>
      </p>

      {loading && <LoadingMessage />}

      {!loading && loadError && (
        <>
          <h1>Course unavailable</h1>
          <ErrorMessage
            message={loadError}
            onRetry={canRetryLoad ? () => load(true) : undefined}
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
                load()
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
                <EntityForm
                  embedded
                  heading="New lesson"
                  submitLabel="Add lesson"
                  submittingLabel="Adding..."
                  onSubmit={handleCreateLesson}
                  submitting={isPending('create')}
                />
              )}

              <LessonList
                lessons={lessons}
                editingId={editingLessonId}
                updatingId={getPendingId('toggle', pendingKey)}
                savingId={getPendingId('save', pendingKey)}
                deletingId={getPendingId('delete', pendingKey)}
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
