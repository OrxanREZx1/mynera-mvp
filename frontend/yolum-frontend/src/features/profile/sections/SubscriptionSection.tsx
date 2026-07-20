import { useEffect, useState } from 'react'
import { Crown, ShieldCheck } from 'lucide-react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { PricingCard } from '@/components/shared/PricingCard'
import { Skeleton } from '@/components/ui/skeleton'
import { pricingApi } from '@/services/api/endpoints'
import type { PlanId, PricingPlan } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

export default function SubscriptionSection() {
  const { user, updateUser } = useAuth()
  const [plans, setPlans] = useState<PricingPlan[] | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    pricingApi.list().then(setPlans)
  }, [])

  const handleSelect = (plan: PricingPlan) => {
    updateUser({ planId: plan.id as PlanId, isPremium: plan.id !== 'starter' })
    toast({ variant: 'success', title: `${plan.name} planına keçdin`, description: 'Dəyişiklik dərhal tətbiq olundu.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Abonəlik" />

      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-6 text-white">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15">
          <Crown className="size-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {user?.isPremium ? `${user.planId === 'premium' ? 'Premium' : 'Standart'} planın aktivdir` : 'Planını seç'}
          </h2>
          <p className="text-sm text-white/80">Premium üzvlüklə daha çox imkan əldə et.</p>
        </div>
      </div>

      {!plans && (
        <div className="grid gap-5 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      )}

      {plans && (
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} currentPlanId={user?.planId} onSelect={handleSelect} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-ink-500">
        <ShieldCheck className="size-4 text-success-500" />
        100% təhlükəsiz ödəniş — ödənişləriniz təhlükəsiz şəkildə qorunur.
      </div>
    </div>
  )
}
