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
import { saveDemoProfile, type DemoItLevel, type DemoStatus } from '@/utils/session'
import { googleAuthErrorMessage } from '@/utils/authErrors'

type SignupFlow = 'assessment' | 'direct'

interface UserSignupPageProps {
  flow?: SignupFlow
}

const assessmentSteps = [{ label: 'Məqsədin' }, { label: 'Maraqların' }, { label: 'Haqqında' }]
const directSteps = [{ label: 'Status və səviyyə' }]

export default function UserSignupPage({ flow = 'assessment' }: UserSignupPageProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [data, setData] = useState<UserOnboardingData>(emptyUserOnboardingData)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isDirectFlow = flow === 'direct'
  const steps = isDirectFlow ? directSteps : assessmentSteps

  useEffect(() => {
    if (!isDirectFlow) void analyticsApi.track('signup_started')
  }, [isDirectFlow])

  const patch = (next: Partial<UserOnboardingData>) => setData((prev) => ({ ...prev, ...next }))

  const handleDirectStart = () => {
    saveDemoProfile(data.status as DemoStatus, data.level as DemoItLevel)
    navigate('/mentors', { replace: true })
  }

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
      const detail = (error as { response?: { data?: Record<string, unknown> } })?.response?.data
      const message = detail ? Object.values(detail).flat().join(' ') : 'Məlumatları yoxlayıb yenidən cəhd et.'
      toast({ variant: 'destructive', title: 'Qeydiyyat mümkün olmadı', description: message })
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
    <OnboardingLayout steps={steps} currentStepIndex={stepIndex} wide={isDirectFlow ? stepIndex === 0 : stepIndex < 2}>
      {stepIndex === 0 && (
        <GoalStep
          data={data}
          onChange={patch}
          onNext={isDirectFlow ? handleDirectStart : () => setStepIndex(1)}
          direct={isDirectFlow}
        />
      )}
      {!isDirectFlow && stepIndex === 1 && (
        <InterestsStep data={data} onChange={patch} onNext={() => setStepIndex(2)} onBack={() => setStepIndex(0)} />
      )}
      {!isDirectFlow && stepIndex === 2 && (
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
