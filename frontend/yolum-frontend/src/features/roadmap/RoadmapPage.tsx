import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrainCircuit, Check, ChevronDown, Flame, Lock, MessageCircleMore, Route, Sparkles, Users } from 'lucide-react'
import { lmsApi } from '@/services/api/endpoints'
import type { Roadmap } from '@/types'
import { CircularProgress } from '@/components/shared/CircularProgress'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'

function ModuleRow({
  module,
  defaultOpen,
  onToggleLesson,
}: {
  module: Roadmap['modules'][number]
  defaultOpen?: boolean
  onToggleLesson: (lessonId: string) => void
}) {
  const [open, setOpen] = useState(!!defaultOpen)
  const completedCount = module.lessons.filter((l) => l.completed).length

  return (
    <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-ink-50/60"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {module.index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-ink-900">{module.title}</span>
          <span className="text-xs text-ink-500">{module.duration}</span>
        </span>
        <span className="text-xs font-medium text-ink-500">
          {completedCount}/{module.lessons.length}
        </span>
        <ChevronDown className={cn('size-4 text-ink-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="flex flex-col divide-y divide-ink-100 border-t border-ink-100">
          {module.lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              disabled={lesson.locked}
              onClick={() => onToggleLesson(lesson.id)}
              className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors enabled:hover:bg-ink-50/60 disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  lesson.completed && 'bg-success-500 text-white',
                  lesson.locked && 'bg-ink-100 text-ink-400',
                  !lesson.completed && !lesson.locked && 'border border-ink-300'
                )}
              >
                {lesson.completed && <Check className="size-3.5" />}
                {lesson.locked && <Lock className="size-3" />}
              </span>
              <span className={cn('flex-1 text-sm', lesson.locked ? 'text-ink-400' : 'text-ink-700')}>{lesson.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandAll, setExpandAll] = useState(false)

  useEffect(() => {
    let cancelled = false
    lmsApi
      .myRoadmap()
      .then((data) => {
        if (!cancelled) setRoadmap(data)
      })
      .catch(() => {
        // 404 = user has no roadmap yet — this is a real, expected state,
        // never silently replaced with fabricated progress data.
        if (!cancelled) setRoadmap(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleToggleLesson = async (lessonId: string) => {
    if (!roadmap) return
    // optimistic update
    const optimistic: Roadmap = {
      ...roadmap,
      modules: roadmap.modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) => (l.id === lessonId ? { ...l, completed: !l.completed } : l)),
      })),
    }
    setRoadmap(optimistic)
    try {
      const updated = await lmsApi.toggleLesson(lessonId)
      setRoadmap(updated)
    } catch {
      setRoadmap(roadmap) // revert on failure
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="container flex max-w-4xl flex-col items-center gap-4 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Sparkles className="size-6" />
        </span>
        <h1 className="text-xl font-semibold text-ink-900">Hələ heç bir roadmap-ın yoxdur</h1>
        <p className="max-w-sm text-sm text-ink-500">
          Fərdi öyrənmə yol xəritəni yaratmaq üçün əvvəlcə Aira ilə qısa söhbət et — sənin cavablarına əsasən
          sənə uyğun roadmap qurulacaq.
        </p>
        <Button asChild>
          <Link to="/chat">
            <MessageCircleMore className="size-4" /> Aira ilə başla
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink-900">Yol Xəritəsi</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-5 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
          <CircularProgress value={roadmap.progressPercent} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Seçilmiş yol</p>
            <h2 className="mt-0.5 text-base font-semibold text-ink-900">{roadmap.title}</h2>
            <p className="mt-1 text-xs text-ink-500">
              Tamamlanmış yol{' '}
              <span className="font-medium text-ink-700">
                {roadmap.completedStages} / {roadmap.totalStages}
              </span>{' '}
              mərhələ
            </p>
          </div>
        </div>

        {roadmap.streakDays !== undefined ? (
          <div className="flex flex-col justify-between gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Gündəlik hədəf</h3>
              <Badge variant="warning" className="gap-1">
                <Flame className="size-3.5" /> {roadmap.streakDays} günlük seriya
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs text-ink-500">Bu gün öyrənmə hədəfinizi tamamlayın.</p>
              <div className="flex items-center gap-3">
                <Progress value={roadmap.dailyGoalPercent ?? 0} className="flex-1" />
                <span className="text-xs font-semibold text-ink-700">{roadmap.dailyGoalPercent ?? 0}%</span>
              </div>
            </div>
            <div className="flex gap-6 text-xs text-ink-500">
              <span>
                <span className="block text-sm font-semibold text-ink-900">
                  {((roadmap.learningMinutesToday ?? 0) / 60).toFixed(1)}
                </span>
                saat Öyrənmə vaxtı
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900">{roadmap.topicsCompletedToday ?? 0}</span>
                mövzu Tamamlandı
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center gap-2 rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-5 text-center">
            <p className="text-sm font-medium text-ink-600">Gündəlik izləmə tezliklə</p>
            <p className="text-xs text-ink-400">
              Günlük seriya və öyrənmə vaxtı izləmə funksiyası hazırlanır — hələlik yalnız dərs tamamlanma faizi izlənilir.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">
          Mərhələ <span className="text-primary-600">{roadmap.completedStages}</span> / {roadmap.totalStages}
        </h3>
        <button
          onClick={() => setExpandAll((v) => !v)}
          className="text-sm font-medium text-primary-600 hover:underline"
        >
          {expandAll ? 'Hamısını bağla' : 'Hamısını genişləndir'}
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {roadmap.modules.map((module, i) => (
          <ModuleRow
            key={module.id}
            module={module}
            defaultOpen={expandAll || i === 0}
            onToggleLesson={handleToggleLesson}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
          <Route className="size-5 text-primary-500" />
          <h4 className="text-sm font-semibold text-ink-900">Yeni istiqamət kəşf et</h4>
          <p className="flex-1 text-xs text-ink-500">
            Maraq və hədəflərinə uyğun fərqli sahələr üzrə yeni yol xəritələri yarat və inkişaf planını yenilə.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/signup">Yol xəritəni dəyiş</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
          <BrainCircuit className="size-5 text-primary-500" />
          <h4 className="text-sm font-semibold text-ink-900">AI ilə yol xəritəni fərdiləşdir</h4>
          <p className="flex-1 text-xs text-ink-500">
            Öyrənmə planınla bağlı dəyişiklikləri, məqsədlərini və suallarını AI assistant ilə müzakirə et.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/chat">
              <MessageCircleMore className="size-4" /> AI ilə məsləhətləş
            </Link>
          </Button>
        </div>
        <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-5 shadow-card">
          <Users className="size-5 text-primary-500" />
          <h4 className="text-sm font-semibold text-ink-900">Fərdi mentorluq alın</h4>
          <p className="flex-1 text-xs text-ink-500">
            Süni intellekt və maşın öyrənməsi üzrə mütəxəssislə sessiyaya qoşulun.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/mentors">Mentorlara bax</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
