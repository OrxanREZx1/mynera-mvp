import { SelectableCard } from '@/components/shared/SelectableCard'
import { Button } from '@/components/ui/button'
import { fieldOptions, timeOptions, type UserOnboardingData } from './onboardingData'

interface InterestsStepProps {
  data: UserOnboardingData
  onChange: (patch: Partial<UserOnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function InterestsStep({ data, onChange, onNext, onBack }: InterestsStepProps) {
  const toggleField = (value: string) => {
    const exists = data.fields.includes(value)
    const next = exists ? data.fields.filter((f) => f !== value) : [...data.fields, value]
    onChange({ fields: next })
  }

  const canContinue = data.timeCommitment && data.fields.length > 0

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Həftədə nə qədər vaxt ayıra bilərsən?</h1>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {timeOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              selected={data.timeCommitment === opt.value}
              onClick={() => onChange({ timeCommitment: opt.value })}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink-900">Hansı sahəni seç?</h2>
        <p className="mt-1 text-sm text-ink-500">Bir və ya bir neçə sahə seçə bilərsən.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {fieldOptions.map((opt) => (
            <SelectableCard
              key={opt.value}
              label={opt.label}
              emoji={opt.emoji}
              multi
              selected={data.fields.includes(opt.value)}
              onClick={() => toggleField(opt.value)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          Geri
        </Button>
        <Button size="lg" disabled={!canContinue} onClick={onNext}>
          Növbəti
        </Button>
      </div>
    </div>
  )
}
