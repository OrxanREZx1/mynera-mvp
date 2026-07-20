import { Apple } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleAuthButton } from './GoogleAuthButton'

interface SocialAuthButtonsProps {
  mode: 'signin' | 'signup'
  onGoogleCredential: (credential: string) => Promise<void>
  onGoogleError: (error: unknown) => void
}

export function SocialAuthButtons({ mode, onGoogleCredential, onGoogleError }: SocialAuthButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <GoogleAuthButton mode={mode} onCredential={onGoogleCredential} onError={onGoogleError} />
      <Button
        type="button"
        variant="outline"
        className="mx-auto h-10 w-full max-w-[400px] border-[#dadce0] bg-ink-50 text-sm font-medium text-ink-500 opacity-75"
        disabled
        aria-label="Apple ilə giriş — tezliklə"
        title="Apple ilə giriş tezliklə aktiv olacaq"
      >
        <Apple className="size-4 fill-current" aria-hidden="true" />
        Apple ilə giriş — tezliklə
      </Button>
    </div>
  )
}
