import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { mentorsApi } from '@/services/api/endpoints'
import type { Mentor, MentorCategory } from '@/types'
import { MentorCard, MentorCardSkeleton } from '@/components/shared/MentorCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mentorCategories } from '@/constants/nav'
import { cn } from '@/utils/cn'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Search } from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'

const PAGE_SIZE = 6

export default function MentorFindPage() {
  const [mentors, setMentors] = useState<Mentor[] | null>(null)
  const [category, setCategory] = useState<MentorCategory>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [minRating, setMinRating] = useState([4])
  const { isFavorite, toggle: toggleFavorite } = useFavorites()

  // Reset to page 1 whenever the active filters change. Adjusting state
  // during render (rather than in a useEffect) avoids an extra render pass —
  // see https://react.dev/learn/you-might-not-need-an-effect
  const [prevFilters, setPrevFilters] = useState({ category, query })
  if (prevFilters.category !== category || prevFilters.query !== query) {
    setPrevFilters({ category, query })
    setPage(1)
  }

  useEffect(() => {
    let cancelled = false
    mentorsApi
      .list(category)
      .then((data) => {
        if (!cancelled) setMentors(data)
      })
      .catch(() => {
        if (!cancelled) setMentors([])
      })
    return () => {
      cancelled = true
    }
  }, [category])

  const filtered = useMemo(() => {
    if (!mentors) return []
    return mentors
      .filter((m) => category === 'all' || m.category === category)
      .filter((m) => m.fullName.toLowerCase().includes(query.toLowerCase()) || m.title.toLowerCase().includes(query.toLowerCase()))
      .filter((m) => m.rating >= minRating[0])
  }, [mentors, category, query, minRating])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-ink-900">Mentorlar</h1>
        <p className="text-sm text-ink-500">Sənə uyğun sahədə təcrübəli mentorlarla əlaqə qur.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Axtar"
          leftIcon={<Search className="size-4" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={() => setFiltersOpen(true)} className="sm:w-auto">
          <SlidersHorizontal className="size-4" />
          Filtrlər
        </Button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {mentorCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as MentorCategory)}
            className={cn(
              'shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition-colors',
              category === cat.id ? 'bg-primary-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {!mentors && Array.from({ length: 6 }).map((_, i) => <MentorCardSkeleton key={i} />)}
        {mentors && paginated.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState title="Uyğun mentor tapılmadı" description="Filtrləri dəyişərək yenidən cəhd et." />
          </div>
        )}
        {paginated.map((mentor) => (
          <MentorCard
            key={mentor.id}
            mentor={{ ...mentor, isFavorite: isFavorite(mentor.id) }}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {mentors && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn(
                'flex size-9 items-center justify-center rounded-pill text-sm font-medium transition-colors',
                page === i + 1 ? 'bg-primary-500 text-white' : 'text-ink-600 hover:bg-ink-100'
              )}
            >
              {i + 1}
            </button>
          ))}
          <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Ətraflı filtrlər</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <div className="mb-3 flex items-center justify-between text-sm font-medium text-ink-800">
                <span>Minimum reytinq</span>
                <span className="text-primary-600">{minRating[0].toFixed(1)}+</span>
              </div>
              <Slider min={0} max={5} step={0.5} value={minRating} onValueChange={setMinRating} />
            </div>
            <div>
              <p className="mb-3 text-sm font-medium text-ink-800">Sıralama</p>
              <div className="flex flex-wrap gap-2">
                {['Reytinqə görə', 'Qiymətə görə', 'Təcrübəyə görə'].map((label) => (
                  <button
                    key={label}
                    className="rounded-pill border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-primary-300 hover:text-primary-700"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => setFiltersOpen(false)}>Nəticələri göstər</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
