type ProgressBarProps = {
  progress: number
  completed?: number
  total?: number
}

function ProgressBar({ progress, completed, total }: ProgressBarProps) {
  const hasCounts = completed !== undefined && total !== undefined

  return (
    <div className="progress">
      <p className="progress-label">
        {progress}%
        {hasCounts && ` (${completed}/${total})`}
      </p>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
