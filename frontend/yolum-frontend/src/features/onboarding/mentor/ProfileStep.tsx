import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Pencil, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { MentorOnboardingData } from './onboardingData'

const schema = z.object({
  fullName: z.string().min(2, 'Ad və soyadını daxil et'),
  email: z.string().min(1, 'E-poçt ünvanını daxil et').email('Düzgün e-poçt ünvanı daxil et'),
  password: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
  agree: z.boolean().refine((v) => v === true, { message: 'Davam etmək üçün şərtləri qəbul et' }),
})
type FormValues = z.infer<typeof schema>

interface ProfileStepProps {
  data: MentorOnboardingData
  onNext: (values: FormValues) => void
}

export function ProfileStep({ data, onNext }: ProfileStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: data.fullName, email: data.email, password: data.password, agree: data.agree },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Profilini yarat</h1>
        <p className="mt-1 text-sm text-ink-500">Tələbələrin səni belə tanıyacaq.</p>
      </div>

      <div className="flex flex-col items-center gap-2 self-center">
        <Avatar className="size-20">
          <AvatarImage src={data.avatarUrl} />
          <AvatarFallback>
            <User className="size-8 text-ink-400" />
          </AvatarFallback>
        </Avatar>
        <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
          <Pencil className="size-3.5" />
          Redaktə edin
        </button>
      </div>

      <div>
        <Label htmlFor="fullName">Ad soyad</Label>
        <Input id="fullName" placeholder="Ad və soyadını daxil et" invalid={!!errors.fullName} {...register('fullName')} />
        {errors.fullName && <p className="mt-1.5 text-xs text-danger-500">{errors.fullName.message}</p>}
      </div>

      <div>
        <Label htmlFor="mentor-email">Gmail</Label>
        <Input
          id="mentor-email"
          type="email"
          placeholder="Gmail daxil et"
          leftIcon={<Mail className="size-4" />}
          invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && <p className="mt-1.5 text-xs text-danger-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="mentor-password">Şifrə</Label>
        <Input
          id="mentor-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Şifrəni daxil et"
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

      <Button type="submit" size="lg" className="w-full">
        Növbəti
      </Button>

      <label className="flex items-start gap-2.5 text-sm text-ink-600">
        <Controller
          control={control}
          name="agree"
          render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />}
        />
        Qeydiyyatdan keçərək İstifadə Şərtləri və Məxfilik Siyasəti ilə razılaşıram.
      </label>
      {errors.agree && <p className="-mt-4 text-xs text-danger-500">{errors.agree.message}</p>}
    </form>
  )
}
