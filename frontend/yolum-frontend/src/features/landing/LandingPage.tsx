import { useEffect } from 'react'
import { HeroSection } from '@/features/landing/sections/HeroSection'
import { HowItWorksSection } from '@/features/landing/sections/HowItWorksSection'
import { FeaturesSection } from '@/features/landing/sections/FeaturesSection'
import { PricingSection } from '@/features/landing/sections/PricingSection'
import { FaqSection } from '@/features/landing/sections/FaqSection'
import { CtaSection } from '@/features/landing/sections/CtaSection'
import { analyticsApi } from '@/services/api/endpoints'

export default function LandingPage() {
  useEffect(() => {
    void analyticsApi.track('landing_page_viewed')
  }, [])

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
