import { Check } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ChoiceToggleProps = {
  checked: boolean
  label: ReactNode
  description?: string
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>

/**
 * Case à cocher custom (pas le radio DaisyUI) — pastille + coche.
 */
export function ChoiceToggle({
  checked,
  label,
  description,
  className,
  type = 'button',
  ...props
}: ChoiceToggleProps) {
  return (
    <button
      type={type}
      role="checkbox"
      aria-checked={checked}
      className={cn(
        'flex w-full gap-3 rounded-lg border px-3 py-2.5 text-left transition',
        description ? 'items-start' : 'items-center',
        checked
          ? 'border-primary/40 bg-primary/5'
          : 'border-base-300 bg-white hover:border-primary/30',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded border-2 transition',
          description ? 'mt-0.5' : undefined,
          checked
            ? 'border-primary bg-primary text-primary-content'
            : 'border-base-content/35 bg-white',
        )}
        aria-hidden
      >
        {checked ? <Check className="size-3.5 stroke-[3]" /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-base-content">
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-xs text-base-content/70">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  )
}
