import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  label: string
  error?: string
}

export function PasswordInput({
  id,
  label,
  error,
  className,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className={cn(
            'field-control pr-11',
            error && 'field-control-error',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
          {...props}
        />
        <button
          type="button"
          className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-base-content/60 transition hover:bg-base-200 hover:text-base-content"
          onClick={() => setVisible((current) => !current)}
          aria-label={
            visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
          }
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
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
