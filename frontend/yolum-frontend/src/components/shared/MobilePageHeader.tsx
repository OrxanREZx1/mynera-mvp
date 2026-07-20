import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface MobilePageHeaderProps {
  title: string
  onBack?: () => void
  right?: React.ReactNode
  className?: string
}

export function MobilePageHeader({ title, onBack, right, className }: MobilePageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur lg:hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={onBack ?? (() => navigate(-1))}
        aria-label="Geri"
        className="flex size-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-ink-100"
      >
        <ChevronLeft className="size-5" />
      </button>
      <h1 className="flex-1 truncate px-2 text-center text-base font-semibold text-ink-900">{title}</h1>
      <div className="flex min-w-9 items-center justify-end gap-1">{right}</div>
    </header>
  )
}
