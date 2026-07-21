import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Image, Mail, ShieldCheck, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MentorApplicationFormData } from './onboardingData'

function isOptionalHttpsUrl(value: string): boolean {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const profileSchema = z.object({
  avatar: z.string().refine(isOptionalHttpsUrl, 'Təhlükəsiz HTTPS şəkil linki daxil edin'),
})

type ProfileValues = z.infer<typeof profileSchema>

interface ProfileStepProps {
  data: MentorApplicationFormData
  onNext: (values: ProfileValues) => void
}

export function ProfileStep({ data, onNext }: ProfileStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { avatar: data.avatar },
  })
  const avatar = useWatch({ control, name: 'avatar' })
  const initials =
    data.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'M'

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-primary-600">Addım 1 / 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900">Profil məlumatları</h1>
        <p className="mt-1 text-sm text-ink-500">Müraciətiniz mövcud Mynera hesabınıza bağlanacaq.</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-4">
        <Avatar className="size-20 border border-ink-100">
          <AvatarImage src={avatar} alt={data.fullName} />
          <AvatarFallback className="bg-primary-50 font-semibold text-primary-700">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink-900">Peşəkar profil şəkli</p>
          <p className="mt-1 text-xs leading-5 text-ink-500">
            LinkedIn və ya şəxsi saytınızdakı şəklin təhlükəsiz HTTPS linkini əlavə edin.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="mentor-avatar">Avatar linki</Label>
        <Input
          id="mentor-avatar"
          type="url"
          placeholder="https://example.com/avatar.jpg"
          leftIcon={<Image className="size-4" />}
          invalid={!!errors.avatar}
          {...register('avatar')}
        />
        {errors.avatar && <p className="mt-1.5 text-xs text-danger-500">{errors.avatar.message}</p>}
      </div>

      <div>
        <Label htmlFor="mentor-full-name">Ad və soyad</Label>
        <Input id="mentor-full-name" value={data.fullName} leftIcon={<User className="size-4" />} readOnly />
      </div>

      <div>
        <Label htmlFor="mentor-email">E-poçt</Label>
        <Input id="mentor-email" type="email" value={data.email} leftIcon={<Mail className="size-4" />} readOnly />
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-success-50 p-3 text-xs leading-5 text-success-600">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Ad və e-poçt təsdiqlənmiş hesabınızdan götürülüb. Müraciət təsdiqlənənədək mentor səlahiyyətləri verilməyəcək.
      </div>

      <Button type="submit" size="lg" className="w-full">
        Növbəti
      </Button>
    </form>
  )
}
