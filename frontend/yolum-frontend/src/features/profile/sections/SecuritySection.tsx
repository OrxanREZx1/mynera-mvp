import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, FileText, ShieldCheck } from 'lucide-react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { privacyPolicyLastUpdated, privacyPolicySections } from './privacyPolicyContent'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Cari şifrəni daxil et'),
    newPassword: z.string().min(8, 'Şifrə ən azı 8 simvol olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: 'Şifrələr uyğun gəlmir', path: ['confirmPassword'] })
type FormValues = z.infer<typeof schema>

export default function SecuritySection() {
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [twoFactor, setTwoFactor] = useState(false)
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 700))
    reset()
    toast({ variant: 'success', title: 'Şifrə yeniləndi', description: 'Yeni şifrənlə daxil ola bilərsən.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Təhlükəsizlik" />

      <Card>
        <CardHeader>
          <CardTitle>Şifrəni dəyiş</CardTitle>
          <CardDescription>Hesabını qorumaq üçün mütəmadi olaraq şifrəni yenilə.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <div>
              <Label htmlFor="currentPassword">Cari şifrə</Label>
              <Input
                id="currentPassword"
                type={show.current ? 'text' : 'password'}
                invalid={!!errors.currentPassword}
                rightSlot={
                  <button type="button" onClick={() => setShow((s) => ({ ...s, current: !s.current }))} className="text-ink-400">
                    {show.current ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
                {...register('currentPassword')}
              />
              {errors.currentPassword && <p className="mt-1.5 text-xs text-danger-500">{errors.currentPassword.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="newPassword">Yeni şifrə</Label>
                <Input
                  id="newPassword"
                  type={show.next ? 'text' : 'password'}
                  invalid={!!errors.newPassword}
                  rightSlot={
                    <button type="button" onClick={() => setShow((s) => ({ ...s, next: !s.next }))} className="text-ink-400">
                      {show.next ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                  {...register('newPassword')}
                />
                {errors.newPassword && <p className="mt-1.5 text-xs text-danger-500">{errors.newPassword.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Şifrəni təsdiqlə</Label>
                <Input
                  id="confirmPassword"
                  type={show.confirm ? 'text' : 'password'}
                  invalid={!!errors.confirmPassword}
                  rightSlot={
                    <button type="button" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))} className="text-ink-400">
                      {show.confirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-danger-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-fit" loading={isSubmitting}>
              Şifrəni yenilə
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>İki mərhələli doğrulama</CardTitle>
          <CardDescription>Hesabına giriş zamanı əlavə təhlükəsizlik qatı əlavə et.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-ink-100 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-primary-500" />
              <div>
                <p className="text-sm font-medium text-ink-800">SMS ilə doğrulama</p>
                <p className="text-xs text-ink-500">Daxil olarkən telefonuna kod göndərilsin.</p>
              </div>
            </div>
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Məxfilik Siyasəti</CardTitle>
          <CardDescription>Son yenilənmə: {privacyPolicyLastUpdated}</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="size-4" />
                Tam mətni oxu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Yolum IT Məxfilik Siyasəti</DialogTitle>
                <DialogDescription>Last Updated: {privacyPolicyLastUpdated}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink-600">
                {privacyPolicySections.map((section) => (
                  <div key={section.heading}>
                    <h3 className="mb-1.5 font-semibold text-ink-900">{section.heading}</h3>
                    <p className="whitespace-pre-line">{section.body}</p>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
