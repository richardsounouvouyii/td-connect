import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  planning: 'Planning',
  epreuves: 'Épreuves et corrigés',
  notifications: 'Alertes',
  profil: 'Profil',
  disponibilites: 'Disponibilités',
  seances: 'Séances',
  documents: 'Documents',
  classes: 'Classes et groupes',
  parametres: 'Paramètres',
  etablissements: 'Établissements',
  comptes: 'Comptes et rôles',
}

/** Placeholder commun tant que les écrans métier ne sont pas codés. */
export function SectionPlaceholderPage() {
  const { pathname } = useLocation()
  const slug = pathname.split('/').filter(Boolean).at(-1) ?? 'section'
  const title = titles[slug] ?? 'Section'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-base-content/90">
        Page prévue pour la suite. La navigation du rôle est déjà en place.
      </p>
    </div>
  )
}
