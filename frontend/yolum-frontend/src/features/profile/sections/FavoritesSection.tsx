import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { MentorCard, MentorCardSkeleton } from '@/components/shared/MentorCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useFavorites } from '@/hooks/useFavorites'
import { mentorsApi } from '@/services/api/endpoints'
import type { Mentor } from '@/types'

export default function FavoritesSection() {
  const { favoriteIds, isFavorite, toggle } = useFavorites()
  const [mentors, setMentors] = useState<Mentor[] | null>(null)

  useEffect(() => {
    mentorsApi.list().then(setMentors)
  }, [])

  const favoriteMentors = mentors?.filter((m) => favoriteIds.includes(m.id)) ?? []

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Sevimlilər" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Sevimlilər</h2>
        <p className="text-sm text-ink-500">Bəyəndiyin mentorları burada tapa bilərsən.</p>
      </div>

      {!mentors && (
        <div className="grid gap-5 sm:grid-cols-2">
          <MentorCardSkeleton />
          <MentorCardSkeleton />
        </div>
      )}

      {mentors && favoriteMentors.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Hələ sevimli mentorun yoxdur"
          description="Mentorlar səhifəsində ürək işarəsinə klikləyərək əlavə edə bilərsən."
          actionLabel="Mentorlara bax"
          onAction={() => (window.location.href = '/mentors')}
        />
      )}

      {favoriteMentors.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          {favoriteMentors.map((mentor) => (
            <MentorCard key={mentor.id} mentor={{ ...mentor, isFavorite: isFavorite(mentor.id) }} onToggleFavorite={toggle} />
          ))}
        </div>
      )}

      <Link to="/mentors" className="text-sm font-medium text-primary-600 hover:underline">
        Bütün mentorlara bax →
      </Link>
    </div>
  )
}
