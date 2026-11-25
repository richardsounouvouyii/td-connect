import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { DemoAccountCards } from '@/features/auth/components/DemoAccountCards'
import { useAuth } from '@/features/auth/context/AuthContext'
import {
  readFromPath,
  resolvePostLoginPath,
} from '@/features/auth/lib/route-access'
import { MOCK_PASSWORD } from '@/features/auth/mocks/demo-users'
import type { AuthUser } from '@/features/auth/types'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/loginSchema'
import { cn } from '@/lib/cn'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function LoginForm() {
  const { login, mocksEnabled } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isFilling, setIsFilling] = useState(false)
  const [pulseFields, setPulseFields] = useState(false)
  const fillTokenRef = useRef(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const emailValue = watch('email')
  const busy = isSubmitting || isFilling

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      const user = await login(values)
      const target = resolvePostLoginPath(user.role, readFromPath(location.state))
      void navigate(target, { replace: true })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Impossible de se connecter pour le moment.'
      setServerError(message)
    }
  })

  const typeValue = async (
    field: keyof LoginFormValues,
    value: string,
    token: number,
  ) => {
    setValue(field, '', { shouldDirty: true })
    for (let index = 1; index <= value.length; index += 1) {
      if (fillTokenRef.current !== token) return
      setValue(field, value.slice(0, index), {
        shouldDirty: true,
        shouldValidate: index === value.length,
      })
      await wait(22)
    }
  }

  const fillDemoAccount = async (user: AuthUser) => {
    const token = fillTokenRef.current + 1
    fillTokenRef.current = token
    setServerError(null)
    setIsFilling(true)
    setPulseFields(true)

    try {
      await typeValue('email', user.email, token)
      if (fillTokenRef.current !== token) return
      await wait(80)
      await typeValue('password', MOCK_PASSWORD, token)
    } finally {
      if (fillTokenRef.current === token) {
        setIsFilling(false)
        window.setTimeout(() => setPulseFields(false), 450)
      }
    }
  }

  const emailRegister = register('email')
  const passwordRegister = register('password')

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit} noValidate>
      <Input
        label="Adresse e-mail"
        type="email"
        autoComplete="username"
        placeholder="eleve@demo.td"
        error={errors.email?.message}
        className={cn(pulseFields && 'animate-[field-fill_0.45s_ease-out]')}
        {...emailRegister}
      />

      <PasswordInput
        label="Mot de passe"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        className={cn(pulseFields && 'animate-[field-fill_0.45s_ease-out]')}
        {...passwordRegister}
      />

      {serverError ? (
        <div className="alert alert-error text-sm" role="alert">
          <span>{serverError}</span>
        </div>
      ) : null}

      <Button type="submit" className="mt-1 w-full" disabled={busy}>
        {isSubmitting ? (
          <>
            <span className="loading loading-spinner loading-sm" />
            Connexion…
          </>
        ) : isFilling ? (
          'Remplissage…'
        ) : (
          'Se connecter'
        )}
      </Button>

      {mocksEnabled ? (
        <DemoAccountCards
          selectedEmail={emailValue}
          onSelect={(user) => {
            void fillDemoAccount(user)
          }}
          disabled={busy}
        />
      ) : null}
    </form>
  )
}
