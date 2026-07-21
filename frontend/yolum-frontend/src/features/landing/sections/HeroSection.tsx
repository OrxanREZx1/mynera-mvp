import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import airaMascot from '@/assets/illustrations/aira-mascot.png'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="absolute -top-32 right-0 size-[520px] rounded-full bg-primary-100/70 blur-3xl" />
      <div className="absolute -left-20 top-40 size-72 rounded-full bg-primary-50 blur-3xl" />

      <div className="container relative grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-primary-100 px-3.5 py-1.5 text-xs font-semibold text-primary-700">
            <Sparkles className="size-3.5" />
            AI ilə karyera yönləndirmə
          </span>

          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            AI ilə texnologiyada <span className="text-gradient">Öz Yolunu</span> tap
          </h1>

          <p className="max-w-lg text-lg text-ink-600">
            Yolum IT karyeranı seçməyinə kömək edən AI köməkçisidir. Sənin üçün fərdiləşdirilmiş inkişaf planı yaradır
            və səni real mentorlarla əlaqələndirir.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/demo">
                Başla <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/assessment">Aira-nı sına</Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-2 text-sm text-ink-500">
            <div className="flex -space-x-2.5">
              {[
                '1494790108377-be9c29b29330',
                '1500648767791-00dcc994a43e',
                '1531123897727-8f129e1688ce',
                '1573497019940-1c28c88b4f3e',
              ].map((id) => (
                <img
                  key={id}
                  src={`https://images.unsplash.com/photo-${id}?w=64&h=64&fit=crop&crop=faces`}
                  alt=""
                  className="size-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <span>2,400+ istifadəçi artıq yoluna başladı</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute size-80 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 blur-2xl" />
          <div className="relative w-full max-w-sm">
            <img
              src={airaMascot}
              alt="Aira AI köməkçisi"
              className="relative z-10 mx-auto w-56 drop-shadow-2xl sm:w-72"
            />

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -left-4 top-6 rounded-lg border border-ink-100 bg-white p-3 shadow-pop sm:-left-8"
            >
              <p className="text-xs font-medium text-ink-800">Maraqlarını Kəşf Et</p>
              <p className="text-[11px] text-ink-500">Sənə uyğun yol tap</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -right-2 bottom-8 rounded-lg border border-ink-100 bg-white p-3 shadow-pop sm:-right-6"
            >
              <p className="text-xs font-medium text-ink-800">Roadmap</p>
              <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-pill bg-ink-100">
                <div className="h-full w-1/4 rounded-pill bg-primary-500" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
