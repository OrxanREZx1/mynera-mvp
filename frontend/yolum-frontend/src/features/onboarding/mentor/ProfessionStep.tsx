import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { countryOptions, positionOptions, type MentorOnboardingData } from './onboardingData'

function GithubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.57.1.78-.25.78-.55v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.13v3.16c0 .3.21.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  )
}

function LinkedinIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

const schema = z.object({
  field: z.string().min(2, 'Sahəni daxil et'),
  position: z.string().min(1, 'Vəzifəni seç'),
  experience: z.string().min(1, 'Təcrübəni daxil et'),
  workplace: z.string().min(1, 'Şirkət adını daxil et'),
  skills: z.string().min(1, 'Bacarıqlarını daxil et'),
  country: z.string().min(1, 'Ölkəni seç'),
  linkedin: z.string().optional(),
  github: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface ProfessionStepProps {
  data: MentorOnboardingData
  onNext: (values: FormValues) => void
  onBack: () => void
}

export function ProfessionStep({ data, onNext, onBack }: ProfessionStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      field: data.field,
      position: data.position,
      experience: data.experience,
      workplace: data.workplace,
      skills: data.skills,
      country: data.country,
      linkedin: data.linkedin,
      github: data.github,
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Peşəkar məlumatların</h1>
        <p className="mt-1 text-sm text-ink-500">Bu məlumatlar mentor profilində göstəriləcək.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="field">Sahə</Label>
          <Input id="field" placeholder="Sahəni daxil et" invalid={!!errors.field} {...register('field')} />
          {errors.field && <p className="mt-1.5 text-xs text-danger-500">{errors.field.message}</p>}
        </div>

        <div>
          <Label htmlFor="position">Vəzifə</Label>
          <Controller
            control={control}
            name="position"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="position">
                  <SelectValue placeholder="Vəzifəni seç" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.position && <p className="mt-1.5 text-xs text-danger-500">{errors.position.message}</p>}
        </div>

        <div>
          <Label htmlFor="experience">Təcrübə</Label>
          <Input id="experience" placeholder="məs: 3 il" invalid={!!errors.experience} {...register('experience')} />
          {errors.experience && <p className="mt-1.5 text-xs text-danger-500">{errors.experience.message}</p>}
        </div>

        <div>
          <Label htmlFor="workplace">İş yeri</Label>
          <Input id="workplace" placeholder="Şirkət adı" invalid={!!errors.workplace} {...register('workplace')} />
          {errors.workplace && <p className="mt-1.5 text-xs text-danger-500">{errors.workplace.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="skills">Bacarıqlar</Label>
          <Input id="skills" placeholder="məs: React, AWS" invalid={!!errors.skills} {...register('skills')} />
          {errors.skills && <p className="mt-1.5 text-xs text-danger-500">{errors.skills.message}</p>}
        </div>

        <div>
          <Label htmlFor="country">Ölkə</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Ölkəni seç" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country && <p className="mt-1.5 text-xs text-danger-500">{errors.country.message}</p>}
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            placeholder="LinkedIn linkini daxil et"
            leftIcon={<LinkedinIcon />}
            {...register('linkedin')}
          />
        </div>

        <div>
          <Label htmlFor="github">Github</Label>
          <Input id="github" placeholder="Github linkin daxil et" leftIcon={<GithubIcon />} {...register('github')} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Geri
        </Button>
        <Button type="submit" size="lg">
          Növbəti
        </Button>
      </div>
    </form>
  )
}
