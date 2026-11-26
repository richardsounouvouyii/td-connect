import { useMemo } from 'react'
import { cn } from '@/lib/cn'

/** Toutes les demies-heures 07:00 → 19:00. */
const ALL_TIMES = Array.from({ length: 25 }, (_, index) => {
  const totalMinutes = 7 * 60 + index * 30
  const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minute = String(totalMinutes % 60).padStart(2, '0')
  return `${hour}:${minute}`
})

type Time24FieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  minTime?: string
  maxTime?: string
  className?: string
}

/** Liste déroulante 24 h, bornée par min/max si fournis. */
export function Time24Field({
  id,
  label,
  value,
  onChange,
  minTime = '07:00',
  maxTime = '19:00',
  className,
}: Time24FieldProps) {
  const options = useMemo(() => {
    const filtered = ALL_TIMES.filter(
      (time) => time >= minTime && time <= maxTime,
    )
    if (filtered.includes(value)) return filtered
    return [value, ...filtered].sort()
  }, [minTime, maxTime, value])

  return (
    <div className={cn('w-full', className)}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="field-control"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
