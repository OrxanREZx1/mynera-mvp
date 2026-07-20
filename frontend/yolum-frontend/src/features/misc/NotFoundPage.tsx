import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import airaMascot from '@/assets/illustrations/aira-mascot.png'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <img src={airaMascot} alt="" className="w-32 opacity-80" />
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Bu səhifə tapılmadı</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-500">
          Axtardığın səhifə silinmiş və ya köçürülmüş ola bilər. Ana səhifəyə qayıdaq.
        </p>
      </div>
      <Button asChild>
        <Link to="/">
          <ArrowLeft className="size-4" /> Ana səhifəyə qayıt
        </Link>
      </Button>
    </div>
  )
}
