import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { gamesApi } from '@/services/api/endpoints'
import type { Game } from '@/types'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function GameDetailPage() {
  const { gameId } = useParams()
  const [game, setGame] = useState<Game | null | undefined>(undefined)

  useEffect(() => {
    gamesApi.list().then((games) => setGame(games.find((g) => g.id === gameId) ?? null))
  }, [gameId])

  if (game === undefined) {
    return (
      <div className="container max-w-3xl py-8">
        <Skeleton className="h-72 rounded-lg" />
      </div>
    )
  }

  if (!game) {
    return (
      <div className="container max-w-3xl py-8 text-center">
        <p className="text-ink-600">Oyun tapılmadı.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/games">Oyunlara qayıt</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <MobilePageHeader title={game.title} />
      <div className="container max-w-3xl py-6 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-ink-100 shadow-card">
          <div className="relative aspect-video bg-ink-900">
            <img src={game.imageUrl} alt="" className="h-full w-full object-cover opacity-70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink-900/40 text-center text-white">
              <Gamepad2 className="size-10" />
              <p className="text-lg font-semibold">Oyun mühərriki tezliklə əlavə olunacaq</p>
              <p className="max-w-sm text-sm text-white/80">
                {game.title} üzərində işləyirik — hazır olduqda bu bölmədə birbaşa oynaya biləcəksən.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap gap-2">
              {game.tags.map((tag) => (
                <Badge key={tag} variant="neutral">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-xl font-semibold text-ink-900">{game.title}</h1>
            <p className="text-sm text-ink-600">{game.description}</p>
            <Button asChild variant="outline" className="w-fit">
              <Link to="/games">Digər oyunlara bax</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
