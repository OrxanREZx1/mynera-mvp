import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail } from 'lucide-react'
import type { AuthUser } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { SocialAuthButtons } from '@/components/shared/SocialAuthButtons'
import { useAuth, roleHome } from '@/context/AuthContext'
import { authApi } from '@/services/api/endpoints'
import { useToast } from '@/components/ui/use-toast'
import { authRequestErrorMessage, googleAuthErrorMessage } from '@/utils/authErrors'
import { useDelayedFlag } from '@/hooks/useDelayedFlag'

const schema = z.object({
  email: z.string().min(1, 'E-poçt ünvanını daxil et').email('Düzgün e-poçt ünvanı daxil et'),
  password: z.string().min(6, 'Şifrə ən azı 6 simvol olmalıdır'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const showServerPreparing = useDelayedFlag(isSubmitting)

  const completeLogin = (user: AuthUser) => {
    login(user)
    const from = (location.state as { from?: string } | undefined)?.from
    navigate(from ?? roleHome(user.role), { replace: true })
    toast({ variant: 'success', title: 'Xoş gəldin!', description: 'Uğurla daxil oldun.' })
  }

  const onSubmit = async (values: FormValues) => {
    try {
      completeLogin(await authApi.login(values.email, values.password))
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Daxil olmaq mümkün olmadı',
        description: authRequestErrorMessage(error, 'login'),
      })
    }
  }

  const handleGoogleCredential = async (credential: string) => {
    completeLogin(await authApi.google({ credential }))
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="flex rounded-pill bg-ink-100 p-1">
        <span className="flex-1 rounded-pill bg-white py-2.5 text-center text-sm font-semibold text-ink-800 shadow-sm">
          Daxil ol
        </span>
        <Link
          to="/assessment"
          className="flex-1 rounded-pill py-2.5 text-center text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
        >
          Qeydiyyat
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Daxil ol</h1>
        <p className="mt-1 text-sm text-ink-500">Saniyələr ərzində hesabına daxil ol</p>
      </div>

      <SocialAuthButtons
        mode="signin"
        onGoogleCredential={handleGoogleCredential}
        onGoogleError={(error) =>
          toast({
            variant: 'destructive',
            title: 'Google girişi alınmadı',
            description: googleAuthErrorMessage(error),
          })
        }
      />

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-ink-400">və ya e-poçt ilə davam et</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div>
          <Label htmlFor="email">E-poçt</Label>
          <Input
            id="email"
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
          <Label htmlFor="password">Şifrə</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Şifrəni daxil et"
            invalid={!!errors.password}
            autoComplete="current-password"
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
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
              Şifrəni unutdun?
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Daxil ol
        </Button>
        {showServerPreparing && (
          <p role="status" className="-mt-2 text-center text-xs text-ink-500">
            Server hazırlanır, ilk giriş bir qədər çəkə bilər...
          </p>
        )}
      </form>

      <p className="text-center text-sm text-ink-500">
        Hesabın yoxdur?{' '}
        <Link to="/assessment" className="font-medium text-primary-600 hover:underline">
          Qeydiyyatdan keç
        </Link>
      </p>
      <p className="text-center text-sm">
        <Link to="/mentor/apply" className="font-medium text-ink-500 hover:text-primary-600 hover:underline">
          Mentor kimi qoşul
        </Link>
      </p>
    </div>
  )
}
