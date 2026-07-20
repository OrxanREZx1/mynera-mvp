import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { StepperHeader } from '@/components/shared/StepperHeader'
import { cn } from '@/utils/cn'

interface OnboardingLayoutProps {
  steps: { label: string }[]
  currentStepIndex: number
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}

export function OnboardingLayout({ steps, currentStepIndex, children, footer, wide }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ink-50/40">
      <header className="border-b border-ink-100 bg-white">
        <div className="container flex h-16 items-center justify-between sm:h-20">
          <Logo />
          <Link to="/" className="text-sm font-medium text-ink-500 hover:text-ink-800">
            Sonra tamamla
          </Link>
        </div>
      </header>

      <div className="border-b border-ink-100 bg-white">
        <div className="container py-4">
          <StepperHeader steps={steps} currentIndex={currentStepIndex} />
        </div>
      </div>

      <main className="flex flex-1 justify-center px-4 py-8 sm:py-12">
        <div className={cn('w-full', wide ? 'max-w-2xl' : 'max-w-md')}>{children}</div>
      </main>

      {footer && <div className="sticky bottom-0 border-t border-ink-100 bg-white/95 backdrop-blur">{footer}</div>}
    </div>
  )
}
