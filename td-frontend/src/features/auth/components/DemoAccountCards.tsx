import {
  GraduationCap,
  Shield,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { DEMO_USERS, MOCK_PASSWORD } from '@/features/auth/mocks/demo-users'
import type { AuthUser } from '@/features/auth/types'
import type { Role } from '@/lib/auth/roles'
import { cn } from '@/lib/cn'

const roleMeta: Record<
  Role,
  { label: string; description: string; icon: LucideIcon }
> = {
  STUDENT: {
    label: 'Élève',
    description: 'Planning et documents',
    icon: GraduationCap,
  },
  TRAINER: {
    label: 'Formateur',
    description: 'Séances et ressources',
    icon: UserRound,
  },
  SCHOOL_ADMIN: {
    label: 'Admin école',
    description: 'Classes et validations',
    icon: ShieldCheck,
  },
  SUPER_ADMIN: {
    label: 'Super admin',
    description: 'Écoles et supervision',
    icon: Shield,
  },
}

type DemoAccountCardsProps = {
  selectedEmail?: string
  onSelect: (user: AuthUser) => void
  disabled?: boolean
}

export function DemoAccountCards({
  selectedEmail,
  onSelect,
  disabled = false,
}: DemoAccountCardsProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-base-300" />
        <p className="font-display text-xs font-semibold tracking-[0.12em] text-base-content/80 uppercase">
          Accès démo
        </p>
        <div className="h-px flex-1 bg-base-300" />
      </div>
      <p className="text-center text-sm text-base-content/85">
        Mot de passe :{' '}
        <span className="font-medium text-base-content">{MOCK_PASSWORD}</span>
      </p>

      <ul className="grid grid-cols-2 gap-2.5">
        {DEMO_USERS.map((user) => {
          const meta = roleMeta[user.role]
          const Icon = meta.icon
          const selected = selectedEmail === user.email

          return (
            <li key={user.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onSelect(user)}
                className={cn(
                  'flex h-full w-full flex-col gap-1.5 rounded-xl border bg-base-100 p-3 text-left transition',
                  'hover:border-primary/40 hover:bg-base-200/60',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-base-300',
                  disabled && 'cursor-not-allowed opacity-60',
                )}
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="font-display text-base font-semibold text-base-content">
                  {meta.label}
                </span>
                <span className="text-xs leading-snug text-base-content/85">
                  {meta.description}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
