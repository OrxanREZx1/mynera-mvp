import { motion } from 'framer-motion'
import { Compass, Gamepad2, Users } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'

const steps = [
  {
    icon: Compass,
    title: 'Öyrən',
    description: 'Xüsusi hazırlanmış kursları kəşf et, mentorlarla danış və həmyaşıdlarınla əlaqə qur.',
  },
  {
    icon: Users,
    title: 'Əlaqə Qur',
    description: 'Real mentorlarla fərdi sessiyalar planlaşdır və karyera yollarından təcrübə paylaş.',
  },
  {
    icon: Gamepad2,
    title: 'İnkişaf Et',
    description: 'Əyləncəli oyunlar, viktorinalar və çağırışlar vasitəsilə bacarıqlar inkişaf etdir.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container py-20 sm:py-28">
      <SectionHeading
        eyebrow="3 sadə addım"
        title="Texnologiya Yoluna 3 Sadə Addımda Başla"
        description="AI ideal texnologiya yolunuzu müəyyənləşdirsin — maraqlarınız haqqında bizə danışın, biz sizi düzgün IT sahəsi ilə uyğunlaşdıracağıq."
        className="mx-auto mb-14"
      />

      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-7 shadow-card"
          >
            <span className="absolute right-6 top-6 font-display text-4xl text-primary-100">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="flex size-11 items-center justify-center rounded-md bg-primary-100 text-primary-600">
              <step.icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">{step.title}</h3>
            <p className="text-sm leading-relaxed text-ink-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
