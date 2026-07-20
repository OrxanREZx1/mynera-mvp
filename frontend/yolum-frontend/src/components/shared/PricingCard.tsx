import { Check } from 'lucide-react'
import type { PricingPlan } from '@/types'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

interface PricingCardProps {
  plan: PricingPlan
  currentPlanId?: string
  onSelect?: (plan: PricingPlan) => void
  className?: string
}

export function PricingCard({ plan, currentPlanId, onSelect, className }: PricingCardProps) {
  const isCurrent = currentPlanId === plan.id

  return (
    <div
      className={cn(
        'relative flex flex-col gap-6 rounded-2xl border p-7',
        plan.highlighted
          ? 'border-primary-300 bg-primary-50/60 shadow-glow'
          : 'border-ink-100 bg-white shadow-card',
        className
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-7 rounded-pill bg-primary-500 px-3 py-1 text-xs font-semibold text-white">
          Ən çox seçilən
        </span>
      )}
      <div>
        <h3 className="text-lg font-semibold text-ink-900">{plan.name}</h3>
        <p className="mt-1 text-sm text-ink-600">{plan.description}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-ink-900">{plan.priceMonthly}</span>
        <span className="text-base text-ink-500">₼/ay</span>
      </div>

      <Button
        variant={plan.highlighted ? 'primary' : 'outline'}
        className="w-full"
        disabled={isCurrent}
        onClick={() => onSelect?.(plan)}
      >
        {isCurrent ? 'Cari planın' : plan.ctaLabel}
      </Button>

      <ul className="flex flex-col gap-3.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary-500" />
            <span>
              <span className="block font-medium text-ink-800">{feature.label}</span>
              <span className="text-ink-500">{feature.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
