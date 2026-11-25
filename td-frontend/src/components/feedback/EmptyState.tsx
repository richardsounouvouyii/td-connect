import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 text-center">
      <h2 className="text-lg font-semibold text-base-content">{title}</h2>
      {description ? (
        <p className="max-w-md text-base text-base-content/90">{description}</p>
      ) : null}
      {action}
    </div>
  )
}
