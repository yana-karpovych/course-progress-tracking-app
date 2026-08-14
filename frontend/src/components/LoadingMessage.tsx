type LoadingMessageProps = {
  text?: string
}

function LoadingMessage({ text = 'Loading...' }: LoadingMessageProps) {
  return (
    <p className="loading" role="status" aria-live="polite">
      {text}
    </p>
  )
}

export default LoadingMessage
