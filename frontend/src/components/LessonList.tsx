import type { Lesson } from '../types'
import LessonForm from './LessonForm'

type LessonListProps = {
  lessons: Lesson[]
  editingId: number | null
  updatingId: number | null
  savingId: number | null
  deletingId: number | null
  onStartEdit: (id: number) => void
  onCancelEdit: () => void
  onSaveEdit: (
    id: number,
    data: { title: string; description: string },
  ) => Promise<void>
  onToggleComplete: (lesson: Lesson, isCompleted: boolean) => void
  onDelete: (id: number) => void
}

function LessonList({
  lessons,
  editingId,
  updatingId,
  savingId,
  deletingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleComplete,
  onDelete,
}: LessonListProps) {
  if (lessons.length === 0) {
    return <p className="empty-state">No lessons yet</p>
  }

  return (
    <ul className="lesson-list">
      {lessons.map((lesson) => (
        <li key={lesson.id} className="card lesson-item">
          {editingId === lesson.id ? (
            <LessonForm
              initialTitle={lesson.title}
              initialDescription={lesson.description ?? ''}
              heading="Edit lesson"
              submitLabel="Save"
              submittingLabel="Saving..."
              submitting={savingId === lesson.id}
              onCancel={onCancelEdit}
              onSubmit={(data) => onSaveEdit(lesson.id, data)}
            />
          ) : (
            <>
              <label className="lesson-checkbox">
                <input
                  type="checkbox"
                  checked={lesson.isCompleted}
                  disabled={updatingId === lesson.id}
                  onChange={(event) =>
                    onToggleComplete(lesson, event.target.checked)
                  }
                />
                <span
                  className={
                    lesson.isCompleted
                      ? 'lesson-title completed'
                      : 'lesson-title'
                  }
                >
                  {lesson.title}
                </span>
              </label>
              {lesson.description && <p>{lesson.description}</p>}
              <div className="actions">
                <button type="button" onClick={() => onStartEdit(lesson.id)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(lesson.id)}
                  disabled={deletingId === lesson.id}
                >
                  {deletingId === lesson.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

export default LessonList
