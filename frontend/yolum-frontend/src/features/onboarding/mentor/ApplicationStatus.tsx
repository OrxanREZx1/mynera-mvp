import { Link } from 'react-router-dom'
import { Check, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const stages = [
  { label: 'Göndərildi', icon: Send },
  { label: 'Yoxlanılır', icon: Clock },
  { label: 'Təsdiqləndi', icon: Check },
]

export function ApplicationStatus() {
  const activeStage = 1 // "Yoxlanılır" — freshly submitted applications start in review

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary-100">
        <Send className="size-7 text-primary-600" />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Müraciətin qəbul olundu</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          Müraciətiniz yoxlanılır. Nəticə 24–48 saat ərzində e-poçtunuza göndəriləcək.
        </p>
      </div>

      <div className="flex w-full max-w-sm items-center">
        {stages.map((stage, index) => {
          const isDone = index < activeStage
          const isActive = index === activeStage
          return (
            <div key={stage.label} className={cn('flex items-center', index < stages.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full',
                    isDone && 'bg-primary-500 text-white',
                    isActive && 'bg-primary-100 text-primary-600 ring-4 ring-primary-50',
                    !isDone && !isActive && 'bg-ink-100 text-ink-400'
                  )}
                >
                  <stage.icon className="size-4" />
                </span>
                <span className={cn('text-xs font-medium', isDone || isActive ? 'text-ink-800' : 'text-ink-400')}>
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <span className={cn('mx-2 mb-5 h-px flex-1', isDone ? 'bg-primary-400' : 'bg-ink-200')} />
              )}
            </div>
          )
        })}
      </div>

      <Button asChild size="lg" variant="outline" className="w-full max-w-sm">
        <Link to="/">Əsas səhifəyə qayıt</Link>
      </Button>
    </div>
  )
}
