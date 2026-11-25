import { Wallet } from 'lucide-react'
import {
  formatSessionPrice,
  sessionPricingLabel,
} from '@/features/dashboards/student/lib/format'
import type { StudentSession } from '@/features/dashboards/student/types'
import { cn } from '@/lib/cn'

type SessionPricingRowProps = {
  session: StudentSession
}

/** Badge Payant / Gratuit. */
export function SessionPricingLabel({
  pricing,
}: {
  pricing: StudentSession['pricing']
}) {
  return (
    <span
      className={cn(
        'badge h-auto min-h-0 shrink-0 border-0 px-3 py-1.5 text-xs font-medium leading-none',
        pricing === 'PAID' ? 'badge-success' : 'badge-ghost',
      )}
    >
      {sessionPricingLabel(pricing)}
    </span>
  )
}

/**
 * Ligne tarif payant, même style que Salle :
 * icône → « Prix » → montant coloré · badge Payant à droite.
 */
export function SessionPricingRow({ session }: SessionPricingRowProps) {
  if (session.pricing !== 'PAID') return null

  const priceLabel = formatSessionPrice(session)
  if (!priceLabel) return null

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-base-content/90">
      <div className="flex min-w-0 items-center gap-2">
        <Wallet className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="inline-flex items-center gap-1.5">
          <span>Prix</span>
          <span className="inline-flex items-center  bg-success px-2.5 py-1 text-base font-bold leading-none text-success-content">
            {priceLabel}
          </span>
        </span>
      </div>
      <SessionPricingLabel pricing="PAID" />
    </div>
  )
}
