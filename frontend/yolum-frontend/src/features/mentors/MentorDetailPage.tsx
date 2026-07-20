import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Award, Briefcase, Heart, MessageCircle, Send, ThumbsUp, Users } from 'lucide-react'
import { mentorsApi } from '@/services/api/endpoints'
import { reviews as mockReviews } from '@/services/api/mockData'
import type { Mentor } from '@/types'
import { StarRating } from '@/components/shared/StarRating'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/utils/cn'
import { useToast } from '@/components/ui/use-toast'
import { useFavorites } from '@/hooks/useFavorites'

const sessionOptions = [
  { id: 'short', label: 'Qısa görüş (10–30 dəqiqə)' },
  { id: 'standard', label: 'Standart görüş (30 dəqiqə – 2 saat)' },
  { id: 'long', label: 'Uzunmüddətli mentorluq (1–3 həftə)' },
]

const whyReasons = [
  { icon: Award, label: 'Şəxsi yanaşma' },
  { icon: Briefcase, label: 'Real layihə nümunələri' },
  { icon: ThumbsUp, label: 'Praktiki təcrübə' },
  { icon: Users, label: 'Karyera dəstəyi' },
]

export default function MentorDetailPage() {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [mentor, setMentor] = useState<Mentor | null | undefined>(undefined)
  const [sessionType, setSessionType] = useState('standard')
  const [reviewText, setReviewText] = useState('')
  const { isFavorite, toggle: toggleFavorite } = useFavorites()

  useEffect(() => {
    if (!mentorId) return
    mentorsApi.byId(mentorId).then(setMentor).catch(() => setMentor(null))
  }, [mentorId])

  if (mentor === undefined) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-4 h-64 rounded-lg" />
      </div>
    )
  }

  if (mentor === null) {
    return (
      <div className="container max-w-4xl py-8">
        <EmptyState title="Mentor tapılmadı" description="Bu mentor artıq mövcud deyil." actionLabel="Mentorlara qayıt" onAction={() => navigate('/mentors')} />
      </div>
    )
  }

  return (
    <div className="pb-16">
      <MobilePageHeader title="Mentor haqqında" />

      <div className="container max-w-4xl py-6 sm:py-10">
        <div className="flex flex-col gap-6 sm:flex-row">
          <img src={mentor.avatarUrl} alt={mentor.fullName} className="size-28 shrink-0 rounded-2xl object-cover shadow-card" />
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-600">{mentor.title}</p>
            <h1 className="mt-0.5 text-2xl font-semibold text-ink-900">{mentor.fullName}</h1>
            <p className="text-sm text-ink-500">
              Senior {mentor.title.split(' ')[0]} {mentor.company ? `at ${mentor.company}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
              <span>
                {mentor.country} {mentor.countryFlag}
              </span>
              <StarRating rating={mentor.rating} reviewCount={mentor.reviewCount} />
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-2xl font-semibold text-ink-900">
              {mentor.price}
              <span className="text-sm font-normal text-ink-500"> {mentor.priceUnit}</span>
            </span>
            <button
              onClick={() => toggleFavorite(mentor.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-danger-500"
            >
              <Heart className={cn('size-4', isFavorite(mentor.id) && 'fill-danger-500 text-danger-500')} />
              {isFavorite(mentor.id) ? 'Sevimlilərdə' : 'Sevimlilərə əlavə et'}
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section>
              <h2 className="mb-3 text-base font-semibold text-ink-900">Haqqında</h2>
              <p className="text-sm leading-relaxed text-ink-600">{mentor.bio}</p>
            </section>

            {mentor.skills && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-ink-900">Bacarıqlar</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-base font-semibold text-ink-900">Niyə mənimlə çalışmalısan?</h2>
              <div className="grid grid-cols-2 gap-3">
                {whyReasons.map((reason) => (
                  <div key={reason.label} className="flex items-center gap-2.5 rounded-lg border border-ink-100 bg-white p-3.5 shadow-card">
                    <reason.icon className="size-4 text-primary-500" />
                    <span className="text-sm font-medium text-ink-700">{reason.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {mentor.stats && (
              <section className="grid grid-cols-2 gap-4 rounded-lg border border-ink-100 bg-ink-50/60 p-5 sm:grid-cols-4">
                {[
                  { value: `${mentor.stats.sessions}+`, label: 'Sessiya tamamlanıb' },
                  { value: `${mentor.stats.years}+`, label: 'il Təcrübə' },
                  { value: `${mentor.stats.students}+`, label: 'Tələbə sayı' },
                  { value: `${mentor.stats.satisfaction}%`, label: 'Məmnuniyyət' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-xl font-semibold text-ink-900">{stat.value}</p>
                    <p className="text-xs text-ink-500">{stat.label}</p>
                  </div>
                ))}
              </section>
            )}

            <section>
              <h2 className="mb-4 text-base font-semibold text-ink-900">Rəylər ({mockReviews.length})</h2>
              <div className="mb-5 flex gap-3">
                <Textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Rəy yaz..."
                  className="min-h-[70px] flex-1"
                />
              </div>
              {reviewText && (
                <Button
                  size="sm"
                  className="mb-5"
                  onClick={() => {
                    setReviewText('')
                    toast({ variant: 'success', title: 'Rəyin göndərildi', description: 'Təşəkkürlər!' })
                  }}
                >
                  <Send className="size-3.5" /> Göndər
                </Button>
              )}
              <div className="flex flex-col gap-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="flex gap-3 border-b border-ink-100 pb-4 last:border-0">
                    <img src={review.authorAvatarUrl} alt="" className="size-9 shrink-0 rounded-full object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-ink-800">{review.authorName}</p>
                        <span className="text-xs text-ink-400">{review.date}</span>
                      </div>
                      <p className="text-xs text-ink-500">{review.authorTitle}</p>
                      <StarRating rating={review.rating} className="mt-1" />
                      {review.comment && <p className="mt-1.5 text-sm text-ink-600">{review.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:h-fit">
            <div className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
              <h3 className="text-sm font-semibold text-ink-900">Seans növü seç</h3>
              <div className="flex flex-col gap-2">
                {sessionOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSessionType(opt.id)}
                    className={cn(
                      'rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors',
                      sessionType === opt.id
                        ? 'border-primary-400 bg-primary-50 font-medium text-primary-800'
                        : 'border-ink-200 text-ink-600 hover:border-primary-200'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                onClick={() =>
                  toast({ variant: 'success', title: 'Sessiya planlaşdırıldı', description: `${mentor.fullName} ilə görüşün planlaşdı.` })
                }
              >
                Sessiya planla
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/chat">
                  <MessageCircle className="size-4" /> Mesaj göndər
                </Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
