import { useState } from 'react'
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout'
import { ProfileStep } from './ProfileStep'
import { ProfessionStep } from './ProfessionStep'
import { ServiceStep } from './ServiceStep'
import { ApplicationStatus } from './ApplicationStatus'
import { emptyMentorOnboardingData, type MentorOnboardingData } from './onboardingData'

const steps = [{ label: 'Profil' }, { label: 'Peşə' }, { label: 'Xidmət' }]

export default function MentorSignupPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [data, setData] = useState<MentorOnboardingData>(emptyMentorOnboardingData)

  const patch = (next: Partial<MentorOnboardingData>) => setData((prev) => ({ ...prev, ...next }))

  if (submitted) {
    return (
      <OnboardingLayout steps={steps} currentStepIndex={3}>
        <ApplicationStatus />
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout steps={steps} currentStepIndex={stepIndex} wide>
      {stepIndex === 0 && (
        <ProfileStep
          data={data}
          onNext={(values) => {
            patch(values)
            setStepIndex(1)
          }}
        />
      )}
      {stepIndex === 1 && (
        <ProfessionStep
          data={data}
          onBack={() => setStepIndex(0)}
          onNext={(values) => {
            patch(values)
            setStepIndex(2)
          }}
        />
      )}
      {stepIndex === 2 && (
        <ServiceStep
          data={data}
          onBack={() => setStepIndex(1)}
          onSubmit={async (values) => {
            patch(values)
            await new Promise((r) => setTimeout(r, 900))
            setSubmitted(true)
          }}
        />
      )}
    </OnboardingLayout>
  )
}
