import { useState } from 'react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { SelectableCard } from '@/components/shared/SelectableCard'
import { Button } from '@/components/ui/button'
import { fieldOptions } from '@/features/onboarding/user/onboardingData'
import { useToast } from '@/components/ui/use-toast'

export default function InterestsSection() {
  const [selected, setSelected] = useState<string[]>(['coding', 'design'])
  const { toast } = useToast()

  const toggle = (value: string) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Maraqlarım" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Maraqlarım</h2>
        <p className="text-sm text-ink-500">
          Seçdiyin sahələr roadmap-ını və mentor tövsiyələrini fərdiləşdirməyə kömək edir.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fieldOptions.map((opt) => (
          <SelectableCard
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            multi
            selected={selected.includes(opt.value)}
            onClick={() => toggle(opt.value)}
          />
        ))}
      </div>

      <Button
        className="w-fit"
        onClick={() => toast({ variant: 'success', title: 'Yadda saxlanıldı', description: 'Maraqların yeniləndi.' })}
      >
        Yadda saxla
      </Button>
    </div>
  )
}
