import { Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Mentor } from '@/types'
import { cn } from '@/utils/cn'
import { StarRating } from '@/components/shared/StarRating'
import { Badge } from '@/components/ui/badge'

interface MentorCardProps {
  mentor: Mentor
  onToggleFavorite?: (id: string) => void
  className?: string
}

export function MentorCard({ mentor, onToggleFavorite, className }: MentorCardProps) {
  const visibleTags = mentor.tags.slice(0, 3)
  const extraCount = mentor.tags.length - visibleTags.length

  return (
    <Link
      to={`/mentors/${mentor.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
        <img
          src={mentor.avatarUrl}
          alt={mentor.fullName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <button
          type="button"
          aria-label="Sevimlilərə əlavə et"
          onClick={(e) => {
            e.preventDefault()
            onToggleFavorite?.(mentor.id)
          }}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-sm backdrop-blur transition-colors hover:text-danger-500"
        >
          <Heart className={cn('size-4', mentor.isFavorite && 'fill-danger-500 text-danger-500')} />
        </button>
        {mentor.discountPrice && (
          <Badge variant="danger" className="absolute left-3 top-3 bg-danger-500 text-white">
            Endirim
          </Badge>
        )}
        {mentor.isFree && (
          <Badge variant="success" className="absolute left-3 top-3 bg-success-500 text-white">
            Ödənişsiz
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary-600">{mentor.title}</p>
          <h3 className="mt-0.5 truncate text-base font-semibold text-ink-900">{mentor.fullName}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
          {extraCount > 0 && <Badge variant="outline">+{extraCount}</Badge>}
        </div>

        <div className="flex items-center gap-1 text-sm text-ink-500">
          <MapPin className="size-3.5" />
          <span>{mentor.country}</span>
          <span aria-hidden>{mentor.countryFlag}</span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <StarRating rating={mentor.rating} reviewCount={mentor.reviewCount} />
          <div className="text-right">
            {mentor.discountPrice && (
              <span className="mr-1.5 text-xs text-ink-400 line-through">{mentor.discountPrice}₼</span>
            )}
            <span className="text-base font-semibold text-ink-900">
              {mentor.isFree ? '0.0₼' : `${mentor.price}`}
            </span>
            {!mentor.isFree && <span className="text-xs text-ink-500"> {mentor.priceUnit}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

export function MentorCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-ink-100" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-ink-100" />
        <div className="h-4 w-32 animate-pulse rounded bg-ink-100" />
        <div className="h-3 w-full animate-pulse rounded bg-ink-100" />
        <div className="h-3 w-24 animate-pulse rounded bg-ink-100" />
      </div>
    </div>
  )
}
