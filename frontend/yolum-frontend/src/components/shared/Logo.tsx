import { cn } from '@/utils/cn'
import { Link } from 'react-router-dom'

interface LogoProps {
  className?: string
  to?: string | null
}

export function Logo({ className, to = '/' }: LogoProps) {
  const mark = (
    <span className={cn('inline-flex items-baseline font-display text-2xl leading-none tracking-tight', className)}>
      <span className="text-primary-500">Yolum</span>
      <span className="ml-1 text-ink-900">IT</span>
    </span>
  )

  if (!to) return mark
  return (
    <Link to={to} aria-label="Yolum IT — ana səhifə" className="shrink-0">
      {mark}
    </Link>
  )
}
