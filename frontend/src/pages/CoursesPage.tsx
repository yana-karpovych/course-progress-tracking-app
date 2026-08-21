import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCourse, deleteCourse, getCourses, updateCourse } from '../api'
import ConfirmDialog from '../components/ConfirmDialog'
import EntityForm from '../components/EntityForm'
import ErrorMessage from '../components/ErrorMessage'
import LoadingMessage from '../components/LoadingMessage'
import ProgressBar from '../components/ProgressBar'
import { useAsyncAction } from '../hooks/useAsyncAction'
import { useConfirm } from '../hooks/useConfirm'
import { useResourceLoader } from '../hooks/useResourceLoader'

function CoursesPage() {
  const [editingId, setEditingId] = useState<number | null>(null)

  const {
    data: courses,
    loading,
    hasLoaded,
    error: loadError,
    load,
  } = useResourceLoader(getCourses, {
    errorFallback: 'Failed to load courses',
  })

  const { actionError, setActionError, run, isPending } = useAsyncAction(
    'Request failed',
  )
  const { requestConfirm, confirmRequest, handleConfirm, handleCancel } =
    useConfirm()

  const courseList = courses ?? []

  async function handleCreate(data: { title: string; description: string }) {
    await run(() => createCourse(data), {
      key: 'create',
      errorFallback: 'Failed to create course',
      onSuccess: () => load(),
    })
  }

  async function handleUpdate(
    id: number,
    data: { title: string; description: string },
  ) {
    await run(() => updateCourse(id, data), {
      key: id,
      errorFallback: 'Failed to update course',
      onSuccess: () => {
        setEditingId(null)
        return load()
      },
    })
  }

  async function handleDelete(id: number) {
    const confirmed = await requestConfirm(
      'Delete this course and all its lessons?',
    )
    if (!confirmed) {
      return
    }

    await run(() => deleteCourse(id), {
      key: `delete-${id}`,
      errorFallback: 'Failed to delete course',
      onSuccess: () => load(),
    })
  }

  const showForm = hasLoaded && !loadError && editingId === null
  const showEmptyState = hasLoaded && !loadError && courseList.length === 0

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

      <header className="page-header">
        <h1>Courses</h1>
        <p className="page-intro">
          Create courses and track how many lessons you have completed.
        </p>
      </header>

      {loading && <LoadingMessage />}

      {loadError && (
        <ErrorMessage message={loadError} onRetry={() => load(true)} />
      )}

      {showForm && (
        <section className="section-block">
          <h2 className="section-title">Add a course</h2>
          <EntityForm
            heading="New course"
            submitLabel="Create course"
            submittingLabel="Creating..."
            onSubmit={handleCreate}
            submitting={isPending('create')}
          />
        </section>
      )}

      {actionError && (
        <ErrorMessage
          message={actionError}
          onRetry={() => {
            setActionError(null)
            load()
          }}
        />
      )}

      {showEmptyState && (
        <div className="card empty-state">
          No courses yet. Use the form above to create your first course.
        </div>
      )}

      {hasLoaded && courseList.length > 0 && (
        <section className="section-block">
          <h2 className="section-title">Your courses</h2>
          <ul className="course-list">
            {courseList.map((course) => (
              <li key={course.id} className="card course-card">
                {editingId === course.id ? (
                  <EntityForm
                    initialTitle={course.title}
                    initialDescription={course.description}
                    heading="Edit course"
                    submitLabel="Save"
                    submittingLabel="Saving..."
                    submitting={isPending(course.id)}
                    embedded
                    onCancel={() => setEditingId(null)}
                    onSubmit={(data) => handleUpdate(course.id, data)}
                  />
                ) : (
                  <>
                    <h3 className="course-title">{course.title}</h3>
                    {course.description && (
                      <p className="course-description">{course.description}</p>
                    )}
                    <ProgressBar
                      progress={course.progress ?? 0}
                      completed={course.completedLessons ?? 0}
                      total={course.totalLessons ?? 0}
                    />
                    <div className="actions">
                      <Link to={`/courses/${course.id}`}>Open course</Link>
                      <button type="button" onClick={() => setEditingId(course.id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(course.id)}
                        disabled={isPending(`delete-${course.id}`)}
                      >
                        {isPending(`delete-${course.id}`)
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

export default CoursesPage
