import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout'
import { useAuth } from '@/context/AuthContext'
import { authApi, analyticsApi } from '@/services/api/endpoints'
import { useToast } from '@/components/ui/use-toast'
import { GoalStep } from './GoalStep'
import { InterestsStep } from './InterestsStep'
import { AboutAuthStep } from './AboutAuthStep'
import { emptyUserOnboardingData, type UserOnboardingData } from './onboardingData'
import type { DemoItLevel, DemoStatus } from '@/utils/session'
import { authRequestErrorMessage, googleAuthErrorMessage } from '@/utils/authErrors'

const steps = [{ label: 'Məqsədin' }, { label: 'Maraqların' }, { label: 'Haqqında' }]

export default function UserSignupPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<UserOnboardingData>(emptyUserOnboardingData)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  useEffect(() => {
    void analyticsApi.track('signup_started')
  }, [])

  const patch = (next: Partial<UserOnboardingData>) => setData((prev) => ({ ...prev, ...next }))

  const handleFinalSubmit = async (values: { fullName: string; email: string; password: string }) => {
    try {
      // status and it_level values are collected as backend-compatible enum
      // strings directly (see onboardingData.ts), so no mapping is needed.
      const user = await authApi.register({
        email: values.email,
        password: values.password,
        password2: values.password,
        full_name: values.fullName,
        status: data.status as 'school_student' | 'university_student' | 'graduate' | 'career_switcher',
        it_level: data.level as 'know_nothing' | 'tried_before' | 'know_basics' | 'chose_field_need_roadmap',
      })
      login({ ...user, field: data.fields[0] })
      navigate('/chat')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Qeydiyyat mümkün olmadı',
        description: authRequestErrorMessage(error, 'register'),
      })
    }
  }

  const handleGoogleSubmit = async (credential: string) => {
    const user = await authApi.google({
      credential,
      status: data.status as DemoStatus,
      it_level: data.level as DemoItLevel,
    })
    login({ ...user, field: data.fields[0] })
    navigate('/chat', { replace: true })
    toast({ variant: 'success', title: 'Xoş gəldin!', description: 'Google hesabınla uğurla daxil oldun.' })
  }

  const handleGoogleError = (error: unknown) => {
    toast({
      variant: 'destructive',
      title: 'Google qeydiyyatı alınmadı',
      description: googleAuthErrorMessage(error),
    })
  }

  return (
    <OnboardingLayout steps={steps} currentStepIndex={stepIndex} wide={stepIndex < 2}>
      {stepIndex === 0 && <GoalStep data={data} onChange={patch} onNext={() => setStepIndex(1)} />}
      {stepIndex === 1 && (
        <InterestsStep data={data} onChange={patch} onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} />
      )}
      {stepIndex === 2 && (
        <AboutAuthStep
          onSubmit={handleFinalSubmit}
          onGoogleSubmit={handleGoogleSubmit}
          onGoogleError={handleGoogleError}
          onBack={() => setStepIndex(1)}
        />
      )}
    </OnboardingLayout>
  )
}
