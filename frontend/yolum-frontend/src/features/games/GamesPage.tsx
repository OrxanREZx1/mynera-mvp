import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { gamesApi } from '@/services/api/endpoints'
import type { Game } from '@/types'
import { GameCard } from '@/components/shared/GameCard'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import gamesIllustration from '@/assets/illustrations/games-illustration.png'

export default function GamesPage() {
  const [games, setGames] = useState<Game[] | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    gamesApi.list().then(setGames)
  }, [])

  const filtered = games?.filter(
    (g) => g.title.toLowerCase().includes(query.toLowerCase()) || g.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <div className="mb-8 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-primary-50 to-white p-8 text-center sm:p-12">
        <img src={gamesIllustration} alt="" className="w-32 sm:w-40" />
        <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">Öyrənərək əylən, oynayaraq inkişaf et</h1>
        <p className="max-w-lg text-sm text-ink-600 sm:text-base">
          Bacarıqlarını gücləndirən interaktiv oyunlarla öyrənmə səfərini daha əyləncəli hala gətir.
        </p>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Axtar"
          leftIcon={<Search className="size-4" />}
          className="max-w-sm bg-white"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {!games && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
        {filtered?.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-4">
            <EmptyState title="Oyun tapılmadı" description="Fərqli açar sözlə axtarmağı sına." />
          </div>
        )}
        {filtered?.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}
