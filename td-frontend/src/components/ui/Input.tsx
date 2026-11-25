import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({
  id,
  label,
  error,
  className,
  ...props
}: InputProps) {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          'field-control',
          error && 'field-control-error',
          className,
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p
          id={inputId ? `${inputId}-error` : undefined}
          className="mt-1 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}
