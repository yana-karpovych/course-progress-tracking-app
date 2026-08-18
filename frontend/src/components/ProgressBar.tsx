type ProgressBarProps = {
  progress: number
  completed?: number
  total?: number
}

function ProgressBar({ progress, completed, total }: ProgressBarProps) {
  const hasCounts = completed !== undefined && total !== undefined

  let summary: string
  if (hasCounts) {
    if (total === 0) {
      summary = 'No lessons yet'
    } else if (completed === 0) {
      summary = `0 of ${total} lessons completed`
    } else if (completed === total) {
      summary = `All ${total} lessons completed`
    } else {
      summary = `${completed} of ${total} lessons completed`
    }
  } else {
    summary = `${progress}% complete`
  }

  return (
    <section
      className="progress-section"
      aria-label="Course progress"
    >
      <div className="progress-header">
        <span className="progress-heading">Course progress</span>
        <span className="progress-value">{progress}%</span>
      </div>
      <p className="progress-summary">{summary}</p>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${progress}% complete`}
      >
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </section>
  )
}

export default ProgressBar
