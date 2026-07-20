import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center', className)}>
      <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-card">
        <Icon className="size-5 text-ink-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-ink-800">{title}</p>
        {description && <p className="max-w-xs text-sm text-ink-500">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
