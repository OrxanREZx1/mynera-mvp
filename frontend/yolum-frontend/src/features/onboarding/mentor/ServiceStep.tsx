import { Controller, useForm, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { SelectableCard } from '@/components/shared/SelectableCard'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  offeredServiceOptions,
  paymentPreferenceOptions,
  sessionTypeOptions,
  targetMenteeOptions,
  type MentorApplicationFormData,
} from './onboardingData'

const serviceSchema = z.object({
  motivation: z.string().trim().min(20, 'Motivasiyanızı ən azı 20 simvolla izah edin').max(800),
  targetMenteeTypes: z.array(z.string()).min(1, 'Ən azı bir istifadəçi tipi seçin'),
  offeredServices: z.array(z.string()).min(1, 'Ən azı bir xidmət seçin'),
  sessionTypes: z.array(z.string()).min(1, 'Ən azı bir sessiya formatı seçin'),
  paymentPreference: z.string().min(1, 'Ödəniş seçimini qeyd edin'),
})

type ServiceValues = z.infer<typeof serviceSchema>

interface ServiceStepProps {
  data: MentorApplicationFormData
  onSubmit: (values: ServiceValues) => Promise<void>
  onBack: () => void
  submissionError?: string | null
}

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
}

export function ServiceStep({ data, onSubmit, onBack, submissionError }: ServiceStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      motivation: data.motivation,
      targetMenteeTypes: data.targetMenteeTypes,
      offeredServices: data.offeredServices,
      sessionTypes: data.sessionTypes,
      paymentPreference: data.paymentPreference,
    },
  })
  const motivationLength = useWatch({ control, name: 'motivation' })?.length ?? 0

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-7">
      <div>
        <p className="text-sm font-semibold text-primary-600">Addım 3 / 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-900">Mentorluq xidməti</h1>
        <p className="mt-1 text-sm text-ink-500">Kimlərə, hansı formatda və necə dəstək verəcəyinizi müəyyən edin.</p>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="motivation">Niyə mentor olmaq istəyirsiniz?</Label>
          <span className="text-xs text-ink-400">{motivationLength}/800</span>
        </div>
        <Controller
          control={control}
          name="motivation"
          render={({ field }) => (
            <Textarea
              id="motivation"
              rows={5}
              maxLength={800}
              placeholder="Təcrübənizi paylaşmaq motivasiyanızı qısa şəkildə izah edin..."
              invalid={!!errors.motivation}
              {...field}
            />
          )}
        />
        {errors.motivation && <p className="mt-1.5 text-xs text-danger-500">{errors.motivation.message}</p>}
      </div>

      <ChoiceGroup
        title="Kimlərə mentorluq etmək istəyirsiniz?"
        name="targetMenteeTypes"
        control={control}
        options={targetMenteeOptions}
        error={errors.targetMenteeTypes?.message}
      />

      <ChoiceGroup
        title="Təklif etdiyiniz xidmətlər"
        name="offeredServices"
        control={control}
        options={offeredServiceOptions}
        error={errors.offeredServices?.message}
      />

      <ChoiceGroup
        title="Sessiya formatları"
        name="sessionTypes"
        control={control}
        options={sessionTypeOptions}
        error={errors.sessionTypes?.message}
      />

      <div>
        <h2 className="text-base font-semibold text-ink-900">Ödəniş seçimi</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Controller
            control={control}
            name="paymentPreference"
            render={({ field }) => (
              <>
                {paymentPreferenceOptions.map((option) => (
                  <SelectableCard
                    key={option.value}
                    label={option.label}
                    selected={field.value === option.value}
                    onClick={() => field.onChange(option.value)}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.paymentPreference && (
          <p className="mt-1.5 text-xs text-danger-500">{errors.paymentPreference.message}</p>
        )}
      </div>

      {submissionError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-danger-500/20 bg-danger-50 p-3 text-sm text-danger-600"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {submissionError}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink-100 pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={isSubmitting}>
          Geri
        </Button>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Müraciəti göndər
        </Button>
      </div>
    </form>
  )
}

interface ChoiceGroupProps {
  title: string
  name: 'targetMenteeTypes' | 'offeredServices' | 'sessionTypes'
  control: Control<ServiceValues>
  options: ReadonlyArray<{ value: string; label: string }>
  error?: string
}

function ChoiceGroup({ title, name, control, options, error }: ChoiceGroupProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Controller
          control={control}
          name={name}
          render={({ field }) => {
            const selectedValues = field.value as string[]
            return (
              <>
                {options.map((option) => (
                  <SelectableCard
                    key={option.value}
                    label={option.label}
                    multi
                    selected={selectedValues.includes(option.value)}
                    onClick={() => field.onChange(toggleValue(selectedValues, option.value))}
                  />
                ))}
              </>
            )
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-danger-500">{error}</p>}
    </div>
  )
}
