import { useEffect, useState } from 'react'
import { MessageSquareText, Search, Sparkles, Star, ThumbsUp } from 'lucide-react'
import { mentorDashboardApi } from '@/services/api/endpoints'
import type { Review } from '@/types'
import { StatCard } from '@/components/shared/StatCard'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { StarRating } from '@/components/shared/StarRating'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

export default function MentorReviewsPage() {
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    mentorDashboardApi.reviews().then(setReviews)
  }, [])

  const filtered = reviews?.filter((r) => r.authorName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="pb-16">
      <MobilePageHeader title="Rəylər" />
      <div className="container max-w-4xl py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="hidden text-2xl font-semibold text-ink-900 lg:block">Rəylər</h1>
          <p className="text-sm text-ink-500">Tələbələrin seanslardan sonra verdiyi bütün rəylər.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Star} label="Ortalama reytinq" value="4.8" trend="0.2% bu ay" iconClassName="bg-warning-50 text-warning-600" />
          <StatCard icon={MessageSquareText} label="Ümumi rəy" value={30} sub="Hamısı" />
          <StatCard icon={ThumbsUp} label="Müsbət rəy" value="87%" trend="8% bu ay" iconClassName="bg-success-50 text-success-600" />
          <StatCard icon={Sparkles} label="Yeni rəy" value={7} sub="Bu ay" />
        </div>

        <Input
          placeholder="Axtar"
          leftIcon={<Search className="size-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-5"
        />

        {!reviews && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        )}

        {reviews && filtered?.length === 0 && <EmptyState title="Rəy tapılmadı" />}

        <div className="flex flex-col gap-3">
          {filtered?.map((review) => (
            <div key={review.id} className="flex gap-3 rounded-lg border border-ink-100 bg-white p-4 shadow-card">
              <img src={review.authorAvatarUrl} alt="" className="size-11 shrink-0 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink-900">{review.topic}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-xs text-ink-500">
                  {review.authorName} · {review.authorTitle}
                </p>
                {review.comment && <p className="mt-1.5 text-sm text-ink-600">{review.comment}</p>}
                <p className="mt-1 text-xs text-ink-400">{review.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
