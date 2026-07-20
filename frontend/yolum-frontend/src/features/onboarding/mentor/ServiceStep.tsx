import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { SelectableCard } from '@/components/shared/SelectableCard'
import {
  helpTypeOptions,
  offeringOptions,
  paymentTypeOptions,
  sessionTypeOptions,
  type MentorOnboardingData,
} from './onboardingData'

const schema = z.object({
  motivation: z.string().min(10, 'Ən azı bir neçə cümlə yaz').max(400),
  helpTypes: z.array(z.string()).min(1, 'Ən azı birini seç'),
  offerings: z.array(z.string()).min(1, 'Ən azı birini seç'),
  sessionTypes: z.array(z.string()).min(1, 'Ən azı birini seç'),
  paymentTypes: z.array(z.string()).min(1, 'Birini seç'),
  introVideoDescription: z.string().max(400).optional(),
})
type FormValues = z.infer<typeof schema>

interface ServiceStepProps {
  data: MentorOnboardingData
  onSubmit: (values: FormValues) => Promise<void> | void
  onBack: () => void
}

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function ServiceStep({ data, onSubmit, onBack }: ServiceStepProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      motivation: data.motivation,
      helpTypes: data.helpTypes,
      offerings: data.offerings,
      sessionTypes: data.sessionTypes,
      paymentTypes: data.paymentTypes,
      introVideoDescription: data.introVideoDescription,
    },
  })

  const motivationLength = useWatch({ control, name: 'motivation' })?.length ?? 0
  const introLength = useWatch({ control, name: 'introVideoDescription' })?.length ?? 0

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values))} noValidate className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Xidmətlərin haqqında</h1>
        <p className="mt-1 text-sm text-ink-500">Tələbələr bu məlumata əsasən səni seçəcək.</p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="motivation">Niyə mentor olmaq istəyirsən?</Label>
          <span className="text-xs text-ink-400">{motivationLength}/400</span>
        </div>
        <Controller
          control={control}
          name="motivation"
          render={({ field }) => (
            <Textarea
              id="motivation"
              placeholder="Təsvir əlavə et..."
              maxLength={400}
              invalid={!!errors.motivation}
              {...field}
            />
          )}
        />
        {errors.motivation && <p className="mt-1.5 text-xs text-danger-500">{errors.motivation.message}</p>}
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink-900">Hansı tip istifadəçilərə kömək etmək istəyirsən?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="helpTypes"
            render={({ field }) => (
              <>
                {helpTypeOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    multi
                    selected={field.value.includes(opt.value)}
                    onClick={() => field.onChange(toggle(field.value, opt.value))}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.helpTypes && <p className="mt-1.5 text-xs text-danger-500">{errors.helpTypes.message}</p>}
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink-900">Nə təklif edə bilərsən?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name="offerings"
            render={({ field }) => (
              <>
                {offeringOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    multi
                    selected={field.value.includes(opt.value)}
                    onClick={() => field.onChange(toggle(field.value, opt.value))}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.offerings && <p className="mt-1.5 text-xs text-danger-500">{errors.offerings.message}</p>}
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink-900">Seans növü?</h2>
        <div className="mt-3 grid gap-3">
          <Controller
            control={control}
            name="sessionTypes"
            render={({ field }) => (
              <>
                {sessionTypeOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    multi
                    selected={field.value.includes(opt.value)}
                    onClick={() => field.onChange(toggle(field.value, opt.value))}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.sessionTypes && <p className="mt-1.5 text-xs text-danger-500">{errors.sessionTypes.message}</p>}
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink-900">Ödəniş?</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="paymentTypes"
            render={({ field }) => (
              <>
                {paymentTypeOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    label={opt.label}
                    selected={field.value.includes(opt.value)}
                    onClick={() => field.onChange(toggle(field.value, opt.value))}
                  />
                ))}
              </>
            )}
          />
        </div>
        {errors.paymentTypes && <p className="mt-1.5 text-xs text-danger-500">{errors.paymentTypes.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="introVideoDescription">
            Öz sahəni yeni başlayan üçün sadə şəkildə izah et və ya qısa tanıtım videosu yüklə
          </Label>
          <span className="text-xs text-ink-400">{introLength}/400</span>
        </div>
        <Controller
          control={control}
          name="introVideoDescription"
          render={({ field }) => (
            <Textarea id="introVideoDescription" placeholder="Təsvir əlavə et..." maxLength={400} {...field} />
          )}
        />
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-ink-400">və ya</span>
          <label className="flex cursor-pointer items-center gap-2 rounded-pill border border-dashed border-ink-300 px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-primary-300 hover:text-primary-700">
            <Upload className="size-4" />
            Fayl yüklə
            <input
              type="file"
              className="hidden"
              accept="video/*"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
          <span className="text-xs text-ink-400">{fileName ?? 'faylın adı, maks. 100Mb'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-ink-100 pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Geri
        </Button>
        <Button type="submit" size="lg" loading={isSubmitting}>
          Qeydiyyatdan keç
        </Button>
      </div>
    </form>
  )
}
