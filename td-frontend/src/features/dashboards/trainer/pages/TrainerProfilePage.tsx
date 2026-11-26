import {
  BookOpen,
  Building2,
  GraduationCap,
  Lock,
  LogOut,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/components/feedback/ToastProvider'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { useAuth } from '@/features/auth/context/AuthContext'
import { MOCK_PASSWORD } from '@/features/auth/mocks/demo-users'
import { TRAINER_PROFILE_DEMO } from '@/features/dashboards/trainer/mocks/trainer-profile'

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

/** Profil formateur — consultation métier + contact / mot de passe. */
export function TrainerProfilePage() {
  const { user, logout } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [phone, setPhone] = useState(TRAINER_PROFILE_DEMO.phone)
  const [phoneDirty, setPhoneDirty] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const [logoutOpen, setLogoutOpen] = useState(false)

  const initials = useMemo(
    () => (user ? initialsFromName(user.fullName) : '?'),
    [user],
  )

  if (!user) return null

  const handleSavePhone = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = phone.trim()
    if (trimmed.length < 8) {
      pushToast({
        title: 'Téléphone invalide',
        description: 'Indiquez un numéro d’au moins 8 caractères.',
        tone: 'warning',
      })
      return
    }

    setPhone(trimmed)
    setPhoneDirty(false)
    pushToast({
      title: 'Contact mis à jour',
      description: 'Votre numéro a été enregistré.',
      tone: 'success',
    })
  }

  const handleChangePassword = (event: FormEvent) => {
    event.preventDefault()
    setPasswordError(null)

    if (currentPassword !== MOCK_PASSWORD) {
      setPasswordError('Mot de passe actuel incorrect.')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(
        'Le nouveau mot de passe doit faire au moins 8 caractères.',
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmation ne correspond pas.')
      return
    }
    if (newPassword === currentPassword) {
      setPasswordError('Choisissez un mot de passe différent de l’actuel.')
      return
    }

    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    pushToast({
      title: 'Mot de passe modifié',
      description: 'Utilisez le nouveau mot de passe à la prochaine connexion.',
      tone: 'success',
    })
  }

  const handleLogoutConfirm = () => {
    setLogoutOpen(false)
    logout()
    navigate('/connexion', { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <header className="rounded-xl border border-base-300 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-xl font-semibold text-primary"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Mon profil
            </p>
            <h1 className="mt-0.5 font-display text-3xl font-semibold tracking-tight">
              {user.fullName}
            </h1>
            <p className="mt-1 font-sans text-base text-base-content/90">
              {user.email}
            </p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="intervention"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <h2
          id="intervention"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Intervention
        </h2>
        <p className="mt-1 text-sm text-base-content/80">
          Plusieurs matières possibles. Défini avec l’administration —
          consultation uniquement.
        </p>

        <div className="mt-4 space-y-4">
          <ProfileChips
            icon={BookOpen}
            label="Matières"
            values={TRAINER_PROFILE_DEMO.subjects}
          />
          <ProfileChips
            icon={GraduationCap}
            label="Classes"
            values={TRAINER_PROFILE_DEMO.classes}
          />
          <ProfileChips
            icon={Users}
            label="Groupes TD"
            values={TRAINER_PROFILE_DEMO.groups}
          />
          <ProfileChips
            icon={Building2}
            label="Établissements"
            values={TRAINER_PROFILE_DEMO.establishments}
          />
        </div>

        <dl className="mt-4 grid gap-4 border-t border-base-200 pt-4 sm:grid-cols-2">
          <ProfileField
            icon={ShieldCheck}
            label="Année scolaire"
            value={TRAINER_PROFILE_DEMO.schoolYear}
          />
          <ProfileField
            icon={Building2}
            label="Établissement principal"
            value={user.establishmentName ?? '—'}
          />
        </dl>
      </section>

      <section
        aria-labelledby="contact"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Phone className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="contact"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Contact
            </h2>
            <p className="mt-1 text-sm text-base-content/80">
              Seul champ modifiable par vous. L’e-mail reste géré par
              l’établissement.
            </p>
          </div>
        </div>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={handleSavePhone}
        >
          <Input
            label="Téléphone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
              setPhoneDirty(true)
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="shrink-0 sm:mb-0.5"
            disabled={!phoneDirty}
          >
            Enregistrer
          </Button>
        </form>
      </section>

      <section
        aria-labelledby="securite"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="securite"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Mot de passe
            </h2>
            <p className="mt-1 text-sm text-base-content/80">
              Changez votre mot de passe régulièrement.
            </p>
          </div>
        </div>

        <form
          className="mt-4 flex max-w-md flex-col gap-3"
          onSubmit={handleChangePassword}
        >
          <PasswordInput
            label="Mot de passe actuel"
            name="currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
          <PasswordInput
            label="Nouveau mot de passe"
            name="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={passwordError ?? undefined}
            required
          />
          <Button type="submit" size="sm" className="self-start">
            Mettre à jour
          </Button>
        </form>
      </section>

      <section
        aria-labelledby="session"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <h2
          id="session"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Session
        </h2>
        <p className="mt-1 text-sm text-base-content/80">
          Déconnectez-vous sur un appareil partagé.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 gap-2 border-error/40 text-error hover:border-error hover:bg-error/10"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="size-4" aria-hidden />
          Se déconnecter
        </Button>
      </section>

      <ConfirmDialog
        open={logoutOpen}
        title="Se déconnecter ?"
        message="Vous devrez vous reconnecter pour accéder à votre espace formateur."
        confirmLabel="Déconnexion"
        cancelLabel="Rester connecté"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0">
        <dt className="text-xs font-medium tracking-wide text-base-content/70 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-base text-base-content">{value}</dd>
      </div>
    </div>
  )
}

function ProfileChips({
  icon: Icon,
  label,
  values,
}: {
  icon: typeof Building2
  label: string
  values: string[]
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium tracking-wide text-base-content/70 uppercase">
          {label}
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {values.map((value) => (
            <li
              key={value}
              className="badge badge-ghost h-auto min-h-0 border border-base-300 bg-base-100 px-2.5 py-1 text-xs font-medium leading-none"
            >
              {value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
