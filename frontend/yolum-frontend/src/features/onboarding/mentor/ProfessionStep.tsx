import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { countryOptions, seniorityOptions, type MentorApplicationFormData } from './onboardingData'

function isLinkedInProfileUrl(value: string): boolean {
  try {
    const hostname = new URL(value).hostname.toLowerCase()
    return hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')
  } catch {
    return false
  }
}

const professionSchema = z.object({
  professionalField: z.string().trim().min(2, 'Peşə sahənizi daxil edin').max(120),
  seniority: z.string().min(1, 'Səviyyənizi seçin'),
  experienceYears: z.number().int('Tam il sayı daxil edin').min(0).max(60, 'Təcrübə 60 ildən çox ola bilməz'),
  skills: z.array(z.string()).min(1, 'Ən azı bir bacarıq əlavə edin').max(12),
  linkedin: z.url('Düzgün LinkedIn linki daxil edin').refine(isLinkedInProfileUrl, 'LinkedIn profil linki daxil edin'),
  country: z.string().min(1, 'Ölkəni seçin'),
})

type ProfessionValues = z.infer<typeof professionSchema>

function LinkedInIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

interface ProfessionStepProps {
  data: MentorApplicationFormData
  onNext: (values: ProfessionValues) => void
  onBack: () => void
}

export function ProfessionStep({ data, onNext, onBack }: ProfessionStepProps) {
  const [skillInput, setSkillInput] = useState('')
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfessionValues>({
    resolver: zodResolver(professionSchema),
    defaultValues: {
      professionalField: data.professionalField,
      seniority: data.seniority,
      experienceYears: data.experienceYears,
      skills: data.skills,
      linkedin: data.linkedin,
      country: data.country,
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-semibold text-primary-600">Addım 2 / 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900">Peşəkar təcrübə</h1>
        <p className="mt-1 text-sm text-ink-500">
          Komandanın təcrübənizi düzgün qiymətləndirməsi üçün əsas məlumatları paylaşın.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="professional-field">Peşə sahəsi</Label>
          <Input
            id="professional-field"
            placeholder="Məsələn: Frontend Development"
            invalid={!!errors.professionalField}
            {...register('professionalField')}
          />
          {errors.professionalField && (
            <p className="mt-1.5 text-xs text-danger-500">{errors.professionalField.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="seniority">Səviyyə</Label>
          <Controller
            control={control}
            name="seniority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="seniority" aria-invalid={!!errors.seniority}>
                  <SelectValue placeholder="Səviyyəni seçin" />
                </SelectTrigger>
                <SelectContent>
                  {seniorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.seniority && <p className="mt-1.5 text-xs text-danger-500">{errors.seniority.message}</p>}
        </div>

        <div>
          <Label htmlFor="experience-years">Təcrübə (il)</Label>
          <Input
            id="experience-years"
            type="number"
            min={0}
            max={60}
            step={1}
            invalid={!!errors.experienceYears}
            {...register('experienceYears', { valueAsNumber: true })}
          />
          {errors.experienceYears && <p className="mt-1.5 text-xs text-danger-500">{errors.experienceYears.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="skills">Bacarıqlar</Label>
          <Controller
            control={control}
            name="skills"
            render={({ field }) => {
              const addSkill = () => {
                const skill = skillInput.trim().replace(/,$/, '')
                if (!skill || field.value.length >= 12) return
                if (!field.value.some((item) => item.toLocaleLowerCase('az') === skill.toLocaleLowerCase('az'))) {
                  field.onChange([...field.value, skill])
                }
                setSkillInput('')
              }

              return (
                <div>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      value={skillInput}
                      placeholder="Məsələn: React"
                      onChange={(event) => setSkillInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ',') {
                          event.preventDefault()
                          addSkill()
                        }
                      }}
                      invalid={!!errors.skills}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addSkill}
                      aria-label="Bacarıq əlavə et"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {field.value.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {field.value.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                        >
                          {skill}
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-primary-100"
                            onClick={() => field.onChange(field.value.filter((item) => item !== skill))}
                            aria-label={`${skill} bacarığını sil`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            }}
          />
          {errors.skills && <p className="mt-1.5 text-xs text-danger-500">{errors.skills.message}</p>}
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            placeholder="https://linkedin.com/in/..."
            leftIcon={<LinkedInIcon />}
            invalid={!!errors.linkedin}
            {...register('linkedin')}
          />
          {errors.linkedin && <p className="mt-1.5 text-xs text-danger-500">{errors.linkedin.message}</p>}
        </div>

        <div>
          <Label htmlFor="country">Ölkə</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="country" aria-invalid={!!errors.country}>
                  <SelectValue placeholder="Ölkəni seçin" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.country && <p className="mt-1.5 text-xs text-danger-500">{errors.country.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-6">
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
