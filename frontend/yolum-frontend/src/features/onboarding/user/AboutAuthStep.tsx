import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { SocialAuthButtons } from '@/components/shared/SocialAuthButtons'

const schema = z.object({
  fullName: z.string().min(2, 'Adını daxil et'),
  email: z.string().min(1, 'E-poçt ünvanını daxil et').email('Düzgün e-poçt ünvanı daxil et'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
  agree: z.boolean().refine((value) => value, { message: 'Davam etmək üçün şərtləri qəbul et' }),
})

type FormValues = z.infer<typeof schema>

interface AboutAuthStepProps {
  onSubmit: (values: { fullName: string; email: string; password: string }) => Promise<void> | void
  onGoogleSubmit: (credential: string) => Promise<void>
  onGoogleError: (error: unknown) => void
  onBack: () => void
}

export function AboutAuthStep({ onSubmit, onGoogleSubmit, onGoogleError, onBack }: AboutAuthStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { agree: false } })

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Demək olar bitdi!</h1>
        <p className="mt-1 text-sm text-ink-500">Google ilə bir toxunuşda hesabını yarat.</p>
      </div>

      <SocialAuthButtons mode="signup" onGoogleCredential={onGoogleSubmit} onGoogleError={onGoogleError} />
      <p className="-mt-4 text-center text-xs leading-relaxed text-ink-400">
        Google ilə davam etməklə İstifadə Şərtləri və Məxfilik Siyasəti ilə razılaşırsan.
      </p>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-ink-400">və ya e-poçt ilə qeydiyyat</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit((values) => onSubmit(values))} noValidate className="flex flex-col gap-5">
        <div>
          <Label htmlFor="signup-fullname">Adın</Label>
          <Input
            id="signup-fullname"
            type="text"
            placeholder="Ad Soyad"
            invalid={!!errors.fullName}
            autoComplete="name"
            {...register('fullName')}
          />
          {errors.fullName && <p className="mt-1.5 text-xs text-danger-500">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label htmlFor="signup-email">E-poçt</Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="E-poçt ünvanını daxil et"
            leftIcon={<Mail className="size-4" />}
            invalid={!!errors.email}
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="mt-1.5 text-xs text-danger-500">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="signup-password">Şifrə</Label>
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifrəni daxil et"
            invalid={!!errors.password}
            autoComplete="new-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                className="text-ink-400 hover:text-ink-700"
                aria-label={showPassword ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            {...register('password')}
          />
          {errors.password && <p className="mt-1.5 text-xs text-danger-500">{errors.password.message}</p>}
        </div>

        <label className="flex items-start gap-2.5 text-sm text-ink-600">
          <Controller
            control={control}
            name="agree"
            render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
            )}
          />
          Qeydiyyatdan keçərək İstifadə Şərtləri və Məxfilik Siyasəti ilə razılaşıram.
        </label>
        {errors.agree && <p className="-mt-3 text-xs text-danger-500">{errors.agree.message}</p>}

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="lg" onClick={onBack} className="flex-1">
            Geri
          </Button>
          <Button type="submit" size="lg" loading={isSubmitting} className="flex-1">
            Qeydiyyatdan keç
          </Button>
        </div>
      </form>
    </div>
  )
}
