import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/services/api/endpoints'

const schema = z.object({
  email: z.string().min(1, 'E-poçt ünvanını daxil et').email('Düzgün e-poçt ünvanı daxil et'),
})
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    await authApi.requestOtp(values.email)
    navigate('/verify-otp', { state: { email: values.email, purpose: 'reset' } })
  }

  return (
    <div className="flex flex-col gap-7">
      <Link to="/login" className="inline-flex w-fit items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft className="size-4" /> Geri
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Şifrəni unutdum</h1>
        <p className="mt-1 text-sm text-ink-500">Şifrənizi bərpa etmək üçün e-poçt ünvanınızı daxil edin.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div>
          <Label htmlFor="email">Gmail</Label>
          <Input
            id="email"
            type="email"
            placeholder="Gmail daxil et"
            leftIcon={<Mail className="size-4" />}
            invalid={!!errors.email}
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="mt-1.5 text-xs text-danger-500">{errors.email.message}</p>}
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          OTP göndər
        </Button>
      </form>
    </div>
  )
}
