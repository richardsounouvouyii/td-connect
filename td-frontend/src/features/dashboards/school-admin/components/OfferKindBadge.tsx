import { cn } from '@/lib/cn'

type OfferKindBadgeProps = {
  kind: 'public' | 'direct'
  className?: string
}

/** Badge bien visible : Offre publique vs Proposition directe. */
export function OfferKindBadge({ kind, className }: OfferKindBadgeProps) {
  const isPublic = kind === 'public'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none px-2.5 py-1 text-xs font-semibold tracking-wide',
        isPublic
          ? 'bg-primary text-primary-content'
          : 'bg-base-300 text-base-content',
        className,
      )}
    >
      {isPublic ? 'Offre publique' : 'Proposition directe'}
    </span>
  )
}
