import { Apple } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { GoogleAuthButton } from './GoogleAuthButton'

interface SocialAuthButtonsProps {
  mode: 'signin' | 'signup'
  onGoogleCredential: (credential: string) => Promise<void>
  onGoogleError: (error: unknown) => void
}

export function SocialAuthButtons({ mode, onGoogleCredential, onGoogleError }: SocialAuthButtonsProps) {
  const { toast } = useToast()

  const handleAppleClick = () => {
    toast({
      title: 'Apple ilə giriş tezliklə',
      description: 'Hazırda Google və ya e-poçt ilə davam edə bilərsən.',
    })
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <GoogleAuthButton mode={mode} onCredential={onGoogleCredential} onError={onGoogleError} />
      <Button
        type="button"
        variant="outline"
        className="mx-auto h-10 w-full max-w-[400px] border-[#dadce0] bg-white text-sm font-medium text-ink-800 hover:bg-ink-50"
        onClick={handleAppleClick}
      >
        <Apple className="size-4 fill-current" aria-hidden="true" />
        Apple ilə davam et
      </Button>
    </div>
  )
}
