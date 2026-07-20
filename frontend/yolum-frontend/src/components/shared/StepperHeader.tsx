import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Step {
  label: string
}

interface StepperHeaderProps {
  steps: Step[]
  currentIndex: number
  className?: string
}

export function StepperHeader({ steps, currentIndex, className }: StepperHeaderProps) {
  return (
    <ol className={cn('flex w-full items-center', className)}>
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isActive = index === currentIndex
        const isLast = index === steps.length - 1
        return (
          <li key={step.label} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isComplete && 'bg-primary-500 text-white',
                  isActive && 'bg-primary-500 text-white ring-4 ring-primary-100',
                  !isComplete && !isActive && 'bg-ink-100 text-ink-500'
                )}
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden whitespace-nowrap text-sm font-medium sm:inline',
                  isActive || isComplete ? 'text-ink-800' : 'text-ink-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn('mx-3 h-px flex-1 transition-colors', isComplete ? 'bg-primary-400' : 'bg-ink-200')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
