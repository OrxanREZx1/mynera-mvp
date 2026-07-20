import { motion } from 'framer-motion'
import { CalendarCheck2, Gamepad2, MessagesSquare, Route, Users2 } from 'lucide-react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { cn } from '@/utils/cn'

const features = [
  {
    icon: Route,
    title: 'Fərdiləşdirilmiş Öyrənmə Yolu',
    description:
      'AI əsaslı sistemimiz maraqların və bacarıq səviyyən haqqında məlumat əldə edir, sonra sənin üçün ən uyğun IT sahəsini və başlanğıc səviyyəli kursları tövsiyə edir.',
    span: 'lg:col-span-2',
  },
  {
    icon: Users2,
    title: 'Fərdi və ya Qrup Mentor Sessiyaları',
    description:
      'Səni yönləndirə, suallarını cavablandıra və karyera yollarından real həyat təcrübələrini paylaşa bilən təcrübəli mütəxəssislərlə əlaqə qur.',
    span: '',
  },
  {
    icon: MessagesSquare,
    title: 'Həmyaşıdlarla Öyrənmə və Söhbət',
    description:
      'Digərləri ilə birlikdə öyrənə, fikir mübadiləsi edə və öyrənmə səyahətin boyu motivasiyalı qala biləcəyin dəstəkləyici bir icmaya qoşul.',
    span: '',
  },
  {
    icon: Gamepad2,
    title: 'İnteraktiv Öyrənmə Oyunları və Viktorinalar',
    description:
      'Öyrəndiklərini praktiki tapşırıqlar və maraqlı oyunlarla möhkəmləndir, əylənərək inkişaf et.',
    span: '',
  },
  {
    icon: CalendarCheck2,
    title: 'Həftəlik Tərəqqi Yoxlamaları',
    description:
      'Hər həftə getdiyin yol haqqında nə hiss etdiyini soruşacağıq — beləliklə, sən nəzarətdə qalır, düzəlişlər edir və heç vaxt sıxışmış hiss etmirsən.',
    span: 'lg:col-span-2',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-ink-50/50 py-20 sm:py-28">
      <div className="container">
        <SectionHeading eyebrow="Xüsusiyyətlər" title="Sənin inkişafın üçün hazırlanmış alətlər" className="mx-auto mb-14" />

        <div className="grid gap-5 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-shadow hover:shadow-card-hover',
                feature.span
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-md bg-primary-100 text-primary-600">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-lg font-semibold text-ink-900">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ink-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
