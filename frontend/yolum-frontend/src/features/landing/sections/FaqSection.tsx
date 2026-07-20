import { useEffect, useState } from 'react'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { faqApi } from '@/services/api/endpoints'
import type { FaqItem } from '@/types'

export function FaqSection() {
  const [items, setItems] = useState<FaqItem[] | null>(null)

  useEffect(() => {
    faqApi.list().then(setItems)
  }, [])

  return (
    <section id="faq" className="bg-ink-50/50 py-20 sm:py-28">
      <div className="container max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Tez-tez verilən suallar" className="mx-auto mb-12" />

        {!items && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        )}

        {items && (
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  )
}
