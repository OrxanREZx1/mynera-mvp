import { useEffect, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { OnboardingLayout } from '@/app/layouts/OnboardingLayout'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { ApplicationStatus } from './ApplicationStatus'
import { mentorApplicationApi, mentorApplicationErrorMessage } from './mentorApplicationApi'
import type { MentorApplication } from './onboardingData'

const steps = [{ label: 'Profil' }, { label: 'Peşə' }, { label: 'Xidmət' }]

interface StatusNavigationState {
  application?: MentorApplication
}

export default function MentorApplicationStatusPage() {
  const { updateUser } = useAuth()
  const location = useLocation()
  const initialApplication = (location.state as StatusNavigationState | null)?.application ?? null
  const [application, setApplication] = useState<MentorApplication | null>(initialApplication)
  const [isLoading, setIsLoading] = useState(!initialApplication)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialApplication) return
    let active = true

    void mentorApplicationApi
      .getMine()
      .then((result) => {
        if (active) setApplication(result)
      })
      .catch((requestError: unknown) => {
        if (active) setError(mentorApplicationErrorMessage(requestError))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [initialApplication])

  useEffect(() => {
    if (application) {
      updateUser({ role: application.status === 'approved' ? 'mentor' : 'student' })
    }
  }, [application, updateUser])

  return (
    <OnboardingLayout steps={steps} currentStepIndex={3}>
      {isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-ink-500">
          <Loader2 className="size-7 animate-spin text-primary-500" aria-hidden="true" />
          <p className="text-sm">Müraciət statusu yüklənir...</p>
        </div>
      )}

      {!isLoading && application && <ApplicationStatus application={application} />}

      {!isLoading && !application && (
        <div className="flex min-h-64 flex-col items-center justify-center gap-5 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
            <AlertCircle className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink-900">Aktiv mentor müraciəti tapılmadı</h1>
            <p className="mt-2 text-sm text-ink-500">
              {error ?? 'Üç addımlı formanı tamamlayaraq müraciət edə bilərsiniz.'}
            </p>
          </div>
          <Button asChild>
            <Link to="/mentor/apply">Müraciətə başla</Link>
          </Button>
        </div>
      )}
    </OnboardingLayout>
  )
}
