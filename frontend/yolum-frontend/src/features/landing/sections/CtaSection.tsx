import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="container pb-20 sm:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl bg-ink-900 px-8 py-16 text-center sm:px-16"
      >
        <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary-500/30 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Texnologiya karyeranın ilk addımını bu gün at
          </h2>
          <p className="max-w-md text-ink-300">
            Aira ilə tanış ol, maraqlarını kəşf et və 5 dəqiqəyə fərdi roadmap-ını əldə et — tamamilə pulsuz.
          </p>
          <Button asChild size="lg">
            <Link to="/signup">
              Pulsuz başla <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
