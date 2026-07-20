import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: number
  className?: string
}

export function StarRating({ rating, reviewCount, size = 14, className }: StarRatingProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 text-sm', className)}>
      <Star size={size} className="fill-warning-500 text-warning-500" />
      <span className="font-medium text-ink-800">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && <span className="text-ink-500">({reviewCount})</span>}
    </div>
  )
}
