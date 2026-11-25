import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type FilterChipProps = {
  active: boolean
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

/** Pastille de filtre compacte, padding suffisant pour le fond coloré. */
export function FilterChip({
  active,
  children,
  className,
  type = 'button',
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-9 items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium leading-none transition sm:text-sm',
        active
          ? 'border-primary bg-primary text-primary-content'
          : 'border-base-300 bg-white text-base-content/90 hover:bg-base-200',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
