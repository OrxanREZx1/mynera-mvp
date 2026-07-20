import { useEffect, useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { faqApi } from '@/services/api/endpoints'
import type { FaqItem } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

export default function HelpSection() {
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null)
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    faqApi.list().then(setFaqs)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Kömək və dəstək" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Kömək və dəstək</h2>
        <p className="text-sm text-ink-500">Sualın var? Cavabı burada tapa bilərsən. Tapmadınsa, bizə yaz — kömək etməyə hazırıq.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bizə yazın</CardTitle>
          <CardDescription>
            Texniki problem, mentorluq, ödəniş və ya hesabınla bağlı sualların üçün komandamızla əlaqə saxla, sənə 24 saat ərzində
            cavab verəcək.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Sualını daxil et..."
            maxLength={100}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-400">{message.length}/100</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setMessage('')}>
                Ləğv et
              </Button>
              <Button
                size="sm"
                disabled={!message.trim()}
                onClick={() => {
                  setMessage('')
                  toast({ variant: 'success', title: 'Mesajın göndərildi', description: '24 saat ərzində cavab veriləcək.' })
                }}
              >
                <Send className="size-3.5" />
                Göndər
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Mail className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-800">E-poçt dəstəyi</p>
            <p className="text-xs text-ink-500">Ətraflı sorğular, əməkdaşlıq təklifləri üçün bizə e-poçt göndər.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:support@yolum.az">support@yolum.az</a>
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-base font-semibold text-ink-900">Tez-tez verilən suallar</h3>
        {!faqs && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-md" />
            ))}
          </div>
        )}
        {faqs && (
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {faqs.map((item, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
