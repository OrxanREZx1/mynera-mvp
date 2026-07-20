import type { LucideIcon } from 'lucide-react'
import { TrendingUp } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  trend?: string
  sub?: string
  iconClassName?: string
  className?: string
}

export function StatCard({ icon: Icon, label, value, trend, sub, iconClassName, className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-card', className)}>
      <div className={cn('flex size-9 items-center justify-center rounded-md bg-primary-50 text-primary-600', iconClassName)}>
        <Icon className="size-4.5" />
      </div>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-ink-900">{value}</p>
      </div>
      {(trend || sub) && (
        <div className="flex items-center gap-1 text-xs">
          {trend && (
            <span className="inline-flex items-center gap-0.5 font-medium text-success-500">
              <TrendingUp className="size-3.5" />
              {trend}
            </span>
          )}
          {sub && <span className="text-ink-400">{sub}</span>}
        </div>
      )}
    </div>
  )
}
