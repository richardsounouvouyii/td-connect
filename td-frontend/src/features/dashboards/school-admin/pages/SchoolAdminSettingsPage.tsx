import {
  Bell,
  Building2,
  Clock3,
  Lock,
  LogOut,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
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
import { ChoiceToggle } from '@/features/dashboards/school-admin/components/ChoiceToggle'
import {
  loadAdminSettings,
  resetAdminSettings,
  saveAdminSettings,
} from '@/features/dashboards/school-admin/mocks/admin-settings'
import type { AdminEstablishmentSettings } from '@/features/dashboards/school-admin/types'

function initialsFromName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

/** Paramètres établissement + compte administrateur. */
export function SchoolAdminSettingsPage() {
  const { user, logout } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()

  const [settings, setSettings] = useState<AdminEstablishmentSettings>(() =>
    loadAdminSettings(),
  )
  const [schoolDirty, setSchoolDirty] = useState(false)
  const [phoneDirty, setPhoneDirty] = useState(false)
  const [newRoom, setNewRoom] = useState('')
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const initials = useMemo(
    () => (user ? initialsFromName(user.fullName) : '?'),
    [user],
  )

  if (!user) return null

  const persist = (next: AdminEstablishmentSettings) => {
    setSettings(next)
    saveAdminSettings(next)
  }

  const patchSchool = <K extends keyof AdminEstablishmentSettings>(
    key: K,
    value: AdminEstablishmentSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }))
    setSchoolDirty(true)
  }

  const togglePolicy = (
    key:
      | 'requireTrainerValidation'
      | 'allowPublicOffers'
      | 'notifyStudentsOnPublish'
      | 'notifyTrainerOnPack',
    label: string,
  ) => {
    const nextValue = !settings[key]
    const next = { ...settings, [key]: nextValue }
    persist(next)
    pushToast({
      title: nextValue ? 'Option activée' : 'Option désactivée',
      description: label,
      tone: nextValue ? 'success' : 'info',
    })
  }

  const handleSaveSchoolAndHours = (event: FormEvent) => {
    event.preventDefault()
    if (settings.name.trim().length < 3) {
      pushToast({
        title: 'Nom invalide',
        description: 'Indiquez le nom de l’établissement.',
        tone: 'warning',
      })
      return
    }
    if (settings.dayStart >= settings.dayEnd) {
      pushToast({
        title: 'Horaires invalides',
        description: 'L’heure de fin doit être après l’heure de début.',
        tone: 'warning',
      })
      return
    }

    persist({
      ...settings,
      name: settings.name.trim(),
      city: settings.city.trim(),
      address: settings.address.trim(),
      phone: settings.phone.trim(),
      email: settings.email.trim(),
      schoolYear: settings.schoolYear.trim(),
      weekdaysLabel: settings.weekdaysLabel.trim(),
    })
    setSchoolDirty(false)
    pushToast({
      title: 'Paramètres enregistrés',
      description: 'Fiche établissement et horaires mis à jour.',
      tone: 'success',
    })
  }

  const handleAddRoom = (event: FormEvent) => {
    event.preventDefault()
    const label = newRoom.trim()
    if (label.length < 2) {
      pushToast({
        title: 'Salle invalide',
        description: 'Indiquez un nom de salle.',
        tone: 'warning',
      })
      return
    }
    if (
      settings.rooms.some(
        (room) => room.toLowerCase() === label.toLowerCase(),
      )
    ) {
      pushToast({
        title: 'Salle déjà présente',
        description: label,
        tone: 'warning',
      })
      return
    }
    const next = { ...settings, rooms: [...settings.rooms, label] }
    persist(next)
    setNewRoom('')
    pushToast({
      title: 'Salle ajoutée',
      description: label,
      tone: 'success',
    })
  }

  const handleRemoveRoom = (label: string) => {
    if (settings.rooms.length <= 1) {
      pushToast({
        title: 'Impossible de retirer',
        description: 'Conservez au moins une salle.',
        tone: 'warning',
      })
      return
    }
    persist({
      ...settings,
      rooms: settings.rooms.filter((room) => room !== label),
    })
    pushToast({
      title: 'Salle retirée',
      description: label,
      tone: 'info',
    })
  }

  const handleSavePhone = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = settings.adminPhone.trim()
    if (trimmed.length < 8) {
      pushToast({
        title: 'Téléphone invalide',
        description: 'Indiquez un numéro d’au moins 8 caractères.',
        tone: 'warning',
      })
      return
    }
    persist({ ...settings, adminPhone: trimmed })
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

  const handleResetConfirm = () => {
    const defaults = resetAdminSettings()
    setSettings(defaults)
    setSchoolDirty(false)
    setPhoneDirty(false)
    setNewRoom('')
    setResetOpen(false)
    pushToast({
      title: 'Valeurs restaurées',
      description: 'Les paramètres démo ont été réinitialisés.',
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
      <header className="rounded-xl border border-base-300 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-base font-semibold text-primary"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Paramètres
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {user.fullName}
            </h1>
            <p className="truncate text-sm text-base-content/80">
              {user.email} · Admin établissement
            </p>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSaveSchoolAndHours}
        className="flex flex-col gap-5"
      >
        <section
          aria-labelledby="fiche-etablissement"
          className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" aria-hidden />
            </span>
            <div>
              <h2
                id="fiche-etablissement"
                className="font-display text-xl font-semibold tracking-tight"
              >
                Fiche établissement
              </h2>
              <p className="mt-1 text-sm text-base-content/80">
                Identité visible pour les formateurs et les élèves rattachés.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Nom"
              name="schoolName"
              value={settings.name}
              onChange={(event) => patchSchool('name', event.target.value)}
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Ville"
                name="city"
                value={settings.city}
                onChange={(event) => patchSchool('city', event.target.value)}
              />
              <Input
                label="Année scolaire"
                name="schoolYear"
                value={settings.schoolYear}
                onChange={(event) =>
                  patchSchool('schoolYear', event.target.value)
                }
              />
            </div>
            <Input
              label="Adresse"
              name="address"
              value={settings.address}
              onChange={(event) => patchSchool('address', event.target.value)}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Téléphone établissement"
                name="schoolPhone"
                type="tel"
                value={settings.phone}
                onChange={(event) => patchSchool('phone', event.target.value)}
              />
              <Input
                label="E-mail établissement"
                name="schoolEmail"
                type="email"
                value={settings.email}
                onChange={(event) => patchSchool('email', event.target.value)}
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="horaires"
          className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
        >
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock3 className="size-4" aria-hidden />
            </span>
            <div>
              <h2
                id="horaires"
                className="font-display text-xl font-semibold tracking-tight"
              >
                Horaires autorisés
              </h2>
              <p className="mt-1 text-sm text-base-content/80">
                Plage dans laquelle les séances TD peuvent être proposées.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Input
              label="Jours d’ouverture"
              name="weekdays"
              value={settings.weekdaysLabel}
              onChange={(event) =>
                patchSchool('weekdaysLabel', event.target.value)
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Début de journée"
                name="dayStart"
                type="time"
                value={settings.dayStart}
                onChange={(event) =>
                  patchSchool('dayStart', event.target.value)
                }
                required
              />
              <Input
                label="Fin de journée"
                name="dayEnd"
                type="time"
                value={settings.dayEnd}
                onChange={(event) => patchSchool('dayEnd', event.target.value)}
                required
              />
            </div>
          </div>
        </section>

        <div className="flex justify-start">
          <Button type="submit" disabled={!schoolDirty}>
            Enregistrer
          </Button>
        </div>
      </form>

      <section
        aria-labelledby="salles"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="salles"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Salles
            </h2>
            <p className="mt-1 text-sm text-base-content/80">
              Liste courte utilisée lors de la proposition de séance.
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {settings.rooms.map((room) => (
            <li
              key={room}
              className="flex items-center justify-between gap-3 border border-base-200 px-3 py-2.5"
            >
              <span className="text-sm font-medium">{room}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-10 gap-1.5 text-error"
                onClick={() => handleRemoveRoom(room)}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Retirer
              </Button>
            </li>
          ))}
        </ul>

        <form
          className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={handleAddRoom}
        >
          <Input
            label="Nouvelle salle"
            name="newRoom"
            value={newRoom}
            onChange={(event) => setNewRoom(event.target.value)}
            placeholder="Ex. Salle B14"
          />
          <Button type="submit" size="sm" className="shrink-0 gap-1.5 sm:mb-0.5">
            <Plus className="size-3.5" aria-hidden />
            Ajouter
          </Button>
        </form>
      </section>

      <section
        aria-labelledby="politiques"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="politiques"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Politiques & notifications
            </h2>
            <p className="mt-1 text-sm text-base-content/80">
              Enregistrement immédiat à chaque bascule.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <ChoiceToggle
            checked={settings.requireTrainerValidation}
            label="Validation formateur obligatoire"
            description="Une séance reste en attente tant que le formateur n’a pas validé."
            onClick={() =>
              togglePolicy(
                'requireTrainerValidation',
                'Validation formateur obligatoire',
              )
            }
          />
          <ChoiceToggle
            checked={settings.allowPublicOffers}
            label="Autoriser les offres publiques"
            description="Proposition ouverte à plusieurs formateurs — le premier qui valide gagne."
            onClick={() =>
              togglePolicy('allowPublicOffers', 'Offres publiques')
            }
          />
          <ChoiceToggle
            checked={settings.notifyStudentsOnPublish}
            label="Notifier les élèves à la publication"
            description="Alerte quand une séance validée apparaît dans leur planning."
            onClick={() =>
              togglePolicy('notifyStudentsOnPublish', 'Notification élèves')
            }
          />
          <ChoiceToggle
            checked={settings.notifyTrainerOnPack}
            label="Notifier le formateur quand le pack est joint"
            description="Épreuve / corrigé disponibles dans Documents formateur."
            onClick={() =>
              togglePolicy('notifyTrainerOnPack', 'Notification pack formateur')
            }
          />
        </div>
      </section>

      <section
        aria-labelledby="compte-admin"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="compte-admin"
              className="font-display text-xl font-semibold tracking-tight"
            >
              Compte administrateur
            </h2>
            <p className="mt-1 text-sm text-base-content/80">
              Coordonnées personnelles. L’e-mail reste géré par le super admin.
            </p>
          </div>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium tracking-wide text-base-content/70 uppercase">
              E-mail
            </dt>
            <dd className="mt-0.5 text-base">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium tracking-wide text-base-content/70 uppercase">
              Établissement
            </dt>
            <dd className="mt-0.5 text-base">
              {user.establishmentName ?? settings.name}
            </dd>
          </div>
        </dl>

        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={handleSavePhone}
        >
          <Input
            label="Téléphone"
            name="adminPhone"
            type="tel"
            autoComplete="tel"
            value={settings.adminPhone}
            onChange={(event) => {
              setSettings((current) => ({
                ...current,
                adminPhone: event.target.value,
              }))
              setPhoneDirty(true)
            }}
          />
          <Button
            type="submit"
            size="sm"
            className="shrink-0 gap-1.5 sm:mb-0.5"
            disabled={!phoneDirty}
          >
            <Phone className="size-3.5" aria-hidden />
            Enregistrer
          </Button>
        </form>
      </section>

      <section
        aria-labelledby="securite-admin"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="size-4" aria-hidden />
          </span>
          <div>
            <h2
              id="securite-admin"
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
        aria-labelledby="demo-reset"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <h2
          id="demo-reset"
          className="font-display text-xl font-semibold tracking-tight"
        >
          Démo
        </h2>
        <p className="mt-1 text-sm text-base-content/80">
          Remet fiche, horaires, salles et politiques aux valeurs d’origine.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 gap-2 border-2 border-base-content/35"
          onClick={() => setResetOpen(true)}
        >
          <RotateCcw className="size-4" aria-hidden />
          Restaurer les valeurs par défaut
        </Button>
      </section>

      <section
        aria-labelledby="session-admin"
        className="rounded-xl border border-base-300 bg-white p-4 font-sans sm:p-5"
      >
        <h2
          id="session-admin"
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
        open={resetOpen}
        title="Restaurer les valeurs par défaut ?"
        message="Fiche, horaires, salles et politiques reviendront aux réglages démo d’origine."
        confirmLabel="Restaurer"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={logoutOpen}
        title="Se déconnecter ?"
        message="Vous devrez vous reconnecter pour accéder à l’espace administrateur."
        confirmLabel="Déconnexion"
        cancelLabel="Rester connecté"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}
