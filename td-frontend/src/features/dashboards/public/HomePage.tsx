import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  Shield,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const highlights = [
  {
    icon: CalendarDays,
    title: 'Planning des TD',
    text: 'Séances physiques visibles par jour, semaine ou mois.',
  },
  {
    icon: BookOpen,
    title: 'Épreuves et corrigés',
    text: 'Documents publiés pour votre classe ou groupe uniquement.',
  },
  {
    icon: ShieldCheck,
    title: 'Accès par établissement',
    text: 'Chaque école conserve ses données et ses droits.',
  },
] as const

const audiences = [
  {
    icon: GraduationCap,
    title: 'Élèves',
    text: 'Consultez vos TD, téléchargez épreuves et corrigés, suivez les alertes.',
  },
  {
    icon: UserRound,
    title: 'Formateurs',
    text: 'Déclarez vos disponibilités, proposez des séances, publiez les documents.',
  },
  {
    icon: Building2,
    title: 'Admins d’école',
    text: 'Gérez classes, salles, validations et le planning de votre établissement.',
  },
  {
    icon: Shield,
    title: 'Super admin',
    text: 'Pilotez les établissements partenaires et les paramètres globaux.',
  },
] as const

const steps = [
  {
    step: '1',
    title: 'Votre établissement vous crée un compte',
    text: 'Pas d’inscription libre : les accès sont validés par l’école.',
  },
  {
    step: '2',
    title: 'Vous vous connectez à TD CONNECT',
    text: 'Sur mobile ou ordinateur, avec le même espace adapté à votre rôle.',
  },
  {
    step: '3',
    title: 'Vous suivez planning et documents',
    text: 'Séances, épreuves, corrigés et notifications au bon moment.',
  },
] as const

/** Page publique d’accueil (non connecté). */
export function HomePage() {
  const { hash } = useLocation()

  useEffect(() => {
    const id = hash.replace('#', '')
    if (!id) return
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div>
      <section
        id="accueil"
        className="relative overflow-hidden bg-gradient-to-br from-primary via-[#0d4aad] to-secondary text-primary-content"
      >
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-16 top-10 size-56 rounded-full bg-accent/30 blur-3xl animate-[soft-float_6s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 size-44 rounded-full bg-white/10 blur-2xl animate-[soft-float_7s_ease-in-out_infinite]" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
          <p className="animate-[fade-up_0.7s_ease-out_both] font-display text-sm font-semibold tracking-[0.18em] text-primary-content/85 uppercase">
            TD CONNECT
          </p>
          <h1 className="mt-3 max-w-3xl animate-[fade-up_0.7s_ease-out_0.08s_both] font-display text-3xl leading-[1.15] font-bold sm:text-4xl lg:text-5xl">
            Les travaux dirigés, clairement organisés
          </h1>
          <p className="mt-4 max-w-xl animate-[fade-up_0.7s_ease-out_0.16s_both] text-base text-primary-content sm:text-lg">
            Planning, salles, épreuves et notifications pour élèves, formateurs
            et administrateurs — sur mobile comme sur ordinateur.
          </p>
          <div className="mt-6 flex animate-[fade-up_0.7s_ease-out_0.24s_both] flex-wrap gap-3">
            <Link to="/connexion">
              <Button className="min-h-11 border-0 bg-white px-5 text-primary shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-base-200 hover:shadow-lg">
                Se connecter
              </Button>
            </Link>
            <a href="#fonctionnalites">
              <Button
                variant="outline"
                className="min-h-11 border-primary-content/35 px-5 text-primary-content transition duration-200 hover:-translate-y-0.5 hover:bg-primary-content/10"
              >
                Découvrir
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section
        id="fonctionnalites"
        className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14"
      >
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Ce que vous retrouvez dans TD CONNECT
          </h2>
          <p className="mt-2 text-base-content/90">
            Une seule plateforme pour suivre les séances physiques de votre
            établissement.
          </p>
        </div>

        <ul className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="border-t border-base-300 pt-5">
              <Icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-base-content/90">
                {text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="pour-qui"
        className="border-y border-base-300 bg-base-200/70"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Une solution pour toute l’équipe pédagogique
            </h2>
            <p className="mt-2 text-base-content/90">
              TD CONNECT centralise l’organisation des TD physiques — sans
              devoirs en ligne, sans chat, sans paiement.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-xl border border-base-300 bg-base-100 p-4"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-3 font-display text-base font-semibold">
                  {title}
                </h3>
                <p className="mt-1.5 text-base leading-relaxed text-base-content/90">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="comment-ca-marche"
        className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14"
      >
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Comment démarrer
          </h2>
          <p className="mt-2 text-base-content/90">
            Simple pour les élèves, structuré pour les établissements.
          </p>
        </div>

        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map(({ step, title, text }) => (
            <li key={step} className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-content">
                {step}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">{title}</h3>
                <p className="mt-1 text-base leading-relaxed text-base-content/90">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="essayer"
        className="relative overflow-hidden bg-gradient-to-br from-secondary to-primary text-primary-content"
      >
        <div className="hero-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-14">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Prêt à présenter TD CONNECT à votre établissement ?
            </h2>
            <p className="mt-2 text-sm text-primary-content/85 sm:text-base">
              Connectez-vous avec un compte démo, explorez les espaces élève,
              formateur ou admin, et montrez concrètement la solution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:justify-end">
            <Link to="/connexion">
              <Button className="min-h-11 border-0 bg-white px-5 text-primary shadow-md transition duration-200 hover:-translate-y-0.5 hover:bg-base-200">
                Se connecter
              </Button>
            </Link>
            <a href="#pour-qui">
              <Button
                variant="outline"
                className="min-h-11 border-primary-content/40 px-5 text-primary-content hover:bg-primary-content/10"
              >
                Voir pour qui
              </Button>
            </a>
            <a href="#fonctionnalites">
              <Button
                variant="ghost"
                className="min-h-11 px-5 text-primary-content hover:bg-primary-content/10"
              >
                Fonctionnalités
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
