import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Game } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export function GameCard({ game, className }: { game: Game; className?: string }) {
  return (
    <div className={cn('group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover', className)}>
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
        <img src={game.imageUrl} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-pill bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
          {game.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="text-base font-semibold text-ink-900">{game.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-ink-500">{game.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {game.tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
        <Link
          to={game.href}
          className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-pill border border-ink-200 py-2.5 text-sm font-medium text-ink-800 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        >
          Oyna <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  )
}
