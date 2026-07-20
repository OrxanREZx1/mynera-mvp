import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectableCardProps {
  label: string
  emoji?: string
  description?: string
  selected: boolean
  onClick: () => void
  className?: string
  multi?: boolean
}

export function SelectableCard({ label, emoji, description, selected, onClick, className, multi }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-center gap-3 rounded-md border px-4 py-3.5 text-left text-sm font-medium transition-all',
        selected
          ? 'border-primary-400 bg-primary-50 text-primary-800 ring-1 ring-primary-300'
          : 'border-ink-200 bg-white text-ink-700 hover:border-primary-200 hover:bg-primary-50/40',
        className
      )}
    >
      {emoji && <span className="text-lg leading-none">{emoji}</span>}
      <span className="flex-1">
        <span className="block">{label}</span>
        {description && <span className="mt-0.5 block text-xs font-normal text-ink-500">{description}</span>}
      </span>
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center border transition-colors',
          multi ? 'rounded-[6px]' : 'rounded-full',
          selected ? 'border-primary-500 bg-primary-500 text-white' : 'border-ink-300 bg-white'
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  )
}
