import { GraduationCap, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

type SiteFooterProps = {
  className?: string
  /** Réserve l’espace de la bottom nav sans bande blanche (fond bleu). */
  withBottomNav?: boolean
}

const linkClass = '!text-white hover:!text-white/90 underline-offset-2 hover:underline'

/** Footer bleu court — essentiel uniquement. */
export function SiteFooter({ className, withBottomNav = false }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        'bg-primary !text-white',
        withBottomNav && 'pb-[4.75rem] lg:pb-3',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-5 shrink-0 !text-white" aria-hidden />
            <span className="font-display text-sm font-semibold !text-white">
              TD CONNECT
            </span>
          </div>

          <nav
            aria-label="Liens pied de page"
            className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
          >
            <a href="/#fonctionnalites" className={linkClass}>
              Fonctionnalités
            </a>
            <Link to="/connexion" className={linkClass}>
              Connexion
            </Link>
            <a href="tel:+2290145000000" className={cn(linkClass, 'inline-flex items-center gap-1')}>
              <Phone className="size-3.5" aria-hidden />
              +229 01 45 00 00 00
            </a>
            <a
              href="mailto:contact@tdconnect.demo"
              className={cn(linkClass, 'inline-flex items-center gap-1')}
            >
              <Mail className="size-3.5" aria-hidden />
              contact@tdconnect.demo
            </a>
          </nav>
        </div>

        <p className="text-xs !text-white/85">
          © {new Date().getFullYear()} TD CONNECT — Porto-Novo, Bénin
        </p>
      </div>
    </footer>
  )
}
