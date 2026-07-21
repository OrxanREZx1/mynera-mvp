import { SelectableCard } from '@/components/shared/SelectableCard'
import { Button } from '@/components/ui/button'
import {
  intentOptions,
  levelOptions,
  motivationOptions,
  statusOptions,
  type UserOnboardingData,
} from './onboardingData'

interface GoalStepProps {
  data: UserOnboardingData
  onChange: (patch: Partial<UserOnboardingData>) => void
  onNext: () => void
}

export function GoalStep({ data, onChange, onNext }: GoalStepProps) {
  const canContinue = data.status && data.intent && data.motivation && data.level

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Hazırkı vəziyyətiniz nədir?</h1>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {statusOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={data.status === opt.value}
              onClick={() => onChange({ status: opt.value })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-900">İT səviyyəniz nədir?</h2>
        <div className="mt-4 grid gap-3">
          {levelOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={data.level === opt.value}
              onClick={() => onChange({ level: opt.value })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-900">Nə etmək istəyirsən?</h2>
        <div className="mt-4 grid gap-3">
          {intentOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={data.intent === opt.value}
              onClick={() => onChange({ intent: opt.value })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-900">Niyə IT sahəsi ilə maraqlanırsan?</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {motivationOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={data.motivation === opt.value}
              onClick={() => onChange({ motivation: opt.value })}
            />
          ))}
        </div>
      </div>

      <Button size="lg" className="w-full sm:w-auto sm:self-end" disabled={!canContinue} onClick={onNext}>
        Növbəti
      </Button>
    </div>
  )
}
