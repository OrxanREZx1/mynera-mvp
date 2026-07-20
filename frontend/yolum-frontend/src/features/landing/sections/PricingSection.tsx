import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { PricingCard } from '@/components/shared/PricingCard'
import { Skeleton } from '@/components/ui/skeleton'
import { pricingApi } from '@/services/api/endpoints'
import type { PricingPlan } from '@/types'

export function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[] | null>(null)

  useEffect(() => {
    pricingApi.list().then(setPlans)
  }, [])

  return (
    <section id="pricing" className="container py-20 sm:py-28">
      <SectionHeading eyebrow="Qiymətlər" title="Yoluna uyğun planı seç" className="mx-auto mb-14" />

      <div className="grid gap-6 lg:grid-cols-3">
        {!plans &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[520px] rounded-2xl" />)}
        {plans?.map((plan) => (
          <PricingCard key={plan.id} plan={plan} onSelect={() => {}} />
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink-500">
        Planını daha sonra da dəyişə bilərsən.{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:underline">
          Qeydiyyatdan keç
        </Link>{' '}
        və pulsuz başla.
      </p>
    </section>
  )
}
