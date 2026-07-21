import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { ProfileStep } from './ProfileStep'
import { ProfessionStep } from './ProfessionStep'
import { ServiceStep } from './ServiceStep'
import { emptyMentorApplicationData, toApplicationPayload, type MentorApplicationFormData } from './onboardingData'
import { mentorApplicationApi, mentorApplicationErrorMessage } from './mentorApplicationApi'

const steps = [{ label: 'Profil' }, { label: 'Peşə' }, { label: 'Xidmət' }]

export default function MentorSignupPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [stepIndex, setStepIndex] = useState(0)
  const [isCheckingApplication, setIsCheckingApplication] = useState(true)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [data, setData] = useState<MentorApplicationFormData>(() => ({
    ...emptyMentorApplicationData,
    avatar: user?.avatarUrl ?? '',
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
  }))

  useEffect(() => {
    let active = true

    void mentorApplicationApi
      .getMine()
      .then((application) => {
        if (active && application) {
          navigate('/mentor/application-status', { replace: true, state: { application } })
        }
      })
      .catch((error: unknown) => {
        if (!active) return
        toast({
          variant: 'destructive',
          title: 'Müraciət statusu yoxlanmadı',
          description: mentorApplicationErrorMessage(error),
        })
      })
      .finally(() => {
        if (active) setIsCheckingApplication(false)
      })

    return () => {
      active = false
    }
  }, [navigate, toast])

  const patch = (values: Partial<MentorApplicationFormData>) => {
    setData((current) => ({ ...current, ...values }))
    setSubmissionError(null)
  }

  const submitApplication = async (values: Partial<MentorApplicationFormData>) => {
    const completedData = { ...data, ...values }
    patch(values)
    setSubmissionError(null)

    try {
      const application = await mentorApplicationApi.create(toApplicationPayload(completedData))
      navigate('/mentor/application-status', { replace: true, state: { application } })
      toast({
        variant: 'success',
        title: 'Müraciət göndərildi',
        description: 'Statusu bu səhifədən izləyə bilərsiniz.',
      })
    } catch (error) {
      const message = mentorApplicationErrorMessage(error)
      setSubmissionError(message)
      toast({ variant: 'destructive', title: 'Müraciət göndərilmədi', description: message })
    }
  }

  if (isCheckingApplication) {
    return (
      <OnboardingLayout steps={steps} currentStepIndex={0}>
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-ink-500">
          <Loader2 className="size-7 animate-spin text-primary-500" aria-hidden="true" />
          <p className="text-sm">Mövcud müraciətiniz yoxlanılır...</p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout steps={steps} currentStepIndex={stepIndex} wide={stepIndex > 0}>
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
          onSubmit={submitApplication}
          submissionError={submissionError}
        />
      )}
    </OnboardingLayout>
  )
}
