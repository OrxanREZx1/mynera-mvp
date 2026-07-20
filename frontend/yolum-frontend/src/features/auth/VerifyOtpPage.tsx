import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { authApi } from '@/services/api/endpoints'
import { useToast } from '@/components/ui/use-toast'

const CODE_LENGTH = 4
const RESEND_SECONDS = 45

export default function VerifyOtpPage() {
  const [values, setValues] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const state = location.state as { email?: string; purpose?: 'reset' | 'signup' } | undefined
  const email = state?.email ?? 'e-poçtuna'

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return
    const next = [...values]
    next[index] = digit.slice(-1)
    setValues(next)
    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    const code = values.join('')
    setIsSubmitting(true)
    try {
      await authApi.verifyOtp(code)
      if (state?.purpose === 'reset') {
        navigate('/reset-password')
      } else {
        navigate('/login')
      }
    } catch {
      toast({ variant: 'destructive', title: 'Kod düzgün deyil', description: 'Zəhmət olmasa yenidən yoxla.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isComplete = values.every((v) => v !== '')

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">OTP Doğrulaması</h1>
        <p className="mt-1 text-sm text-ink-500">
          OTP kodunu daxil edin. <span className="text-ink-700">{email}</span> ünvanına göndərdik.
        </p>
      </div>

      <div className="flex justify-between gap-3">
        {values.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            value={value}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            inputMode="numeric"
            maxLength={1}
            className="h-14 w-14 rounded-md border border-ink-200 text-center text-xl font-semibold text-ink-900 transition-colors focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        ))}
      </div>

      <Button size="lg" className="w-full" disabled={!isComplete} loading={isSubmitting} onClick={handleSubmit}>
        Doğrulama
      </Button>

      <p className="text-center text-sm text-ink-500">
        Kodu almadınız?{' '}
        {countdown > 0 ? (
          <span className="text-ink-400">Yenidən göndər (0:{countdown.toString().padStart(2, '0')})</span>
        ) : (
          <button
            type="button"
            onClick={() => setCountdown(RESEND_SECONDS)}
            className="font-medium text-primary-600 hover:underline"
          >
            Kodu yenidən göndərin
          </button>
        )}
      </p>
    </div>
  )
}
