type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Chargement…' }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-40 flex-col items-center justify-center gap-3 text-base-content/90"
      role="status"
      aria-live="polite"
    >
      <span className="loading loading-spinner loading-md text-primary" />
      <p>{label}</p>
    </div>
  )
}
