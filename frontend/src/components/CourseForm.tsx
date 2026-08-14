import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

type CourseFormProps = {
  onSubmit: (data: { title: string; description: string }) => Promise<void>
  submitting?: boolean
  initialTitle?: string
  initialDescription?: string
  heading?: string
  submitLabel?: string
  submittingLabel?: string
  onCancel?: () => void
}

function CourseForm({
  onSubmit,
  submitting = false,
  initialTitle = '',
  initialDescription = '',
  heading = 'New course',
  submitLabel = 'Create course',
  submittingLabel = 'Creating...',
  onCancel,
}: CourseFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    setTitle(initialTitle)
    setDescription(initialDescription)
  }, [initialTitle, initialDescription])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      return
    }

    await onSubmit({ title: title.trim(), description })

    if (!onCancel) {
      setTitle('')
      setDescription('')
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{heading}</h2>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </label>
      <div className="actions">
        <button type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default CourseForm
