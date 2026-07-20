import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Camera, Eye, EyeOff } from 'lucide-react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/use-toast'

interface AccountForm {
  fullName: string
  email: string
  field: string
  location: string
}

export default function AccountSection() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState } = useForm<AccountForm>({
    defaultValues: {
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      field: user?.field ?? '',
      location: user?.location ?? '',
    },
  })

  const onSubmit = (values: AccountForm) => {
    updateUser(values)
    toast({ variant: 'success', title: 'Yadda saxlanıldı', description: 'Hesab məlumatların yeniləndi.' })
  }

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Hesab məlumatları" />
      <Card>
        <CardHeader>
          <CardTitle>Hesab məlumatları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-16">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <p className="font-medium text-ink-900">{user?.fullName}</p>
              <p className="text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Ad soyad</Label>
              <Input id="fullName" {...register('fullName')} />
            </div>
            <div>
              <Label htmlFor="email">Gmail</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            <div>
              <Label htmlFor="field">Sahəsi</Label>
              <Input id="field" placeholder="məs: UX/UI Dizayner" {...register('field')} />
            </div>
            <div>
              <Label htmlFor="location">Ünvan</Label>
              <Input id="location" placeholder="Azərbaycan, Bakı" {...register('location')} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">Şifrə</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                defaultValue="password123"
                rightSlot={
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-ink-400 hover:text-ink-700">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" loading={formState.isSubmitting}>
                Yadda saxla
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
