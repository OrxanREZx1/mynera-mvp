import { Link, Outlet } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import airaMascot from '@/assets/illustrations/aira-mascot.png'

export function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12 sm:py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
          >
            <ArrowLeft className="size-4" />
            Ana səhifə
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">
            <Outlet />
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 lg:block">
        <div className="bg-noise absolute inset-0 opacity-40" />
        <div className="relative flex h-full flex-col items-center justify-center gap-10 p-16">
          <div className="relative flex items-center justify-center">
            <div className="absolute size-72 rounded-full bg-primary-200/50 blur-3xl" />
            <img src={airaMascot} alt="" className="relative w-64 drop-shadow-xl" />
          </div>

          <div className="relative flex max-w-sm flex-col gap-4">
            <div className="flex items-center gap-2 self-center rounded-pill bg-white/80 px-4 py-2 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" />
              AI ilə karyera yönləndirmə
            </div>
            <h2 className="text-center text-2xl font-semibold text-ink-900">
              AI ilə texnologiyada <span className="text-primary-600">Öz Yolunu</span> tap
            </h2>
            <p className="text-center text-sm text-ink-600">
              Yolum IT karyeranı seçməyinə kömək edən AI köməkçisidir. Sənin üçün fərdiləşdirilmiş inkişaf planı
              yaradır və səni real mentorlarla əlaqələndirir.
            </p>
          </div>

          <div className="grid w-full max-w-sm grid-cols-3 gap-3">
            {[
              { value: '2,400+', label: 'İstifadəçi' },
              { value: '180+', label: 'Mentor' },
              { value: '4.8', label: 'Reytinq' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/70 p-3 text-center shadow-sm backdrop-blur">
                <p className="text-lg font-semibold text-ink-900">{stat.value}</p>
                <p className="text-xs text-ink-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
