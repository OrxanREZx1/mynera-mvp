import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z
  .object({
    password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifrələr uyğun gəlmir',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>
type Status = 'form' | 'success' | 'error'

// Simulated network call — in production this becomes a real API request.
// Kept as a plain module-level function so any impurity (Math.random) is
// unambiguously outside of render.
async function submitNewPassword(): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 700))
  return Math.random() > 0.08
}

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>('form')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    const succeeded = await submitNewPassword()
    setStatus(succeeded ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success-50">
          <CheckCircle2 className="size-8 text-success-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Uğurla yeniləndi</h1>
          <p className="mt-1 text-sm text-ink-500">Şifrən uğurla yeniləndi. İndi yeni şifrənlə daxil ola bilərsən.</p>
        </div>
        <Button size="lg" className="w-full" onClick={() => navigate('/login')}>
          Daxil ol
        </Button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-danger-50">
          <XCircle className="size-8 text-danger-500" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Şifrə yenilənmədi</h1>
          <p className="mt-1 text-sm text-ink-500">Nəsə səhv getdi. Zəhmət olmasa bir az sonra yenidən cəhd et.</p>
        </div>
        <Button size="lg" className="w-full" onClick={() => setStatus('form')}>
          Yenidən cəhd et
        </Button>
        <Link to="/login" className="text-sm font-medium text-ink-500 hover:text-primary-600">
          Girişə qayıt
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Şifrəni yenilə</h1>
        <p className="mt-1 text-sm text-ink-500">Hesabın üçün yeni şifrə təyin et.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div>
          <Label htmlFor="password">Şifrə</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Yeni şifrəni daxil et"
            invalid={!!errors.password}
            rightSlot={
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-ink-400 hover:text-ink-700">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password')}
          />
          {errors.password && <p className="mt-1.5 text-xs text-danger-500">{errors.password.message}</p>}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Şifrəni təsdiqlə</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Yeni şifrəni təkrar daxil et"
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="mt-1.5 text-xs text-danger-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Şifrəni yenilə
        </Button>
      </form>
    </div>
  )
}
