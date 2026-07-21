import { Link } from 'react-router-dom'
import { Check, Clock, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { MentorApplication } from './onboardingData'

interface ApplicationStatusProps {
  application: MentorApplication
}

const statusContent = {
  submitted: {
    title: 'Müraciətiniz qəbul olundu',
    description: 'Müraciətiniz növbəyə əlavə edildi. Komandamız qısa zamanda ilkin yoxlamaya başlayacaq.',
    activeStage: 0,
  },
  under_review: {
    title: 'Müraciətiniz yoxlanılır',
    description: 'Komandamız peşəkar məlumatlarınızı qiymətləndirir. Nəticə e-poçt ünvanınıza göndəriləcək.',
    activeStage: 1,
  },
  approved: {
    title: 'Mentor müraciətiniz təsdiqləndi',
    description:
      'Təbrik edirik! Profilin aktivləşdirilməsi və növbəti onboarding addımları e-poçt vasitəsilə bildiriləcək.',
    activeStage: 2,
  },
  rejected: {
    title: 'Müraciət bu dəfə təsdiqlənmədi',
    description:
      'Əlavə məlumat üçün e-poçtunuzu yoxlayın. Profilinizi gücləndirdikdən sonra yenidən müraciət edə bilərsiniz.',
    activeStage: 2,
  },
} as const

export function ApplicationStatus({ application }: ApplicationStatusProps) {
  const content = statusContent[application.status]
  const isRejected = application.status === 'rejected'
  const finalLabel = isRejected ? 'Təsdiqlənmədi' : 'Təsdiqləndi'
  const stages = [
    { label: 'Göndərildi', icon: Send },
    { label: 'Yoxlanılır', icon: Clock },
    { label: finalLabel, icon: isRejected ? X : Check },
  ]

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div
        className={cn(
          'flex size-16 items-center justify-center rounded-full',
          isRejected ? 'bg-danger-50 text-danger-500' : 'bg-primary-100 text-primary-600'
        )}
      >
        {isRejected ? <X className="size-7" /> : <Send className="size-7" />}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Müraciət #{application.id}</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink-900">{content.title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-500">{content.description}</p>
        {application.submittedAt && (
          <p className="mt-3 text-xs text-ink-400">
            Göndərilmə tarixi:{' '}
            {new Intl.DateTimeFormat('az-AZ', { dateStyle: 'long' }).format(new Date(application.submittedAt))}
          </p>
        )}
      </div>

      <div className="flex w-full max-w-md items-center" aria-label="Müraciət statusu">
        {stages.map((stage, index) => {
          const isDone = index < content.activeStage
          const isActive = index === content.activeStage
          const isRejectedStage = isRejected && index === 2

          return (
            <div key={stage.label} className={cn('flex items-center', index < stages.length - 1 && 'flex-1')}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={cn(
                    'flex size-9 items-center justify-center rounded-full',
                    isDone && 'bg-primary-500 text-white',
                    isActive && !isRejectedStage && 'bg-primary-100 text-primary-600 ring-4 ring-primary-50',
                    isRejectedStage && 'bg-danger-50 text-danger-500 ring-4 ring-danger-50/60',
                    !isDone && !isActive && 'bg-ink-100 text-ink-400'
                  )}
                >
                  <stage.icon className="size-4" />
                </span>
                <span
                  className={cn(
                    'whitespace-nowrap text-xs font-medium',
                    isDone || isActive ? 'text-ink-800' : 'text-ink-400',
                    isRejectedStage && 'text-danger-600'
                  )}
                >
                  {stage.label}
                </span>
              </div>
              {index < stages.length - 1 && (
                <span className={cn('mx-2 mb-5 h-px flex-1', isDone ? 'bg-primary-400' : 'bg-ink-200')} />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link to="/mentors">Mentorları kəşf et</Link>
        </Button>
        <Button asChild size="lg" className="flex-1">
          <Link to="/chat">Aira ilə davam et</Link>
        </Button>
      </div>
    </div>
  )
}
