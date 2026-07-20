import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2, Clock3, Sparkles, Star, Users, Video, Wallet } from 'lucide-react'
import { mentorDashboardApi } from '@/services/api/endpoints'
import type { MentorSession } from '@/types'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<MentorSession[] | null>(null)

  useEffect(() => {
    mentorDashboardApi.sessions().then(setSessions)
  }, [])

  const nextSession = sessions?.find((s) => s.status === 'confirmed')
  const firstName = user?.fullName?.split(' ')[0] ?? 'Mentor'

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-ink-900">Xoş gəldin, {firstName}!</h1>
        <p className="mt-1 text-sm text-ink-500">Bu gün daha çox tələbəyə ilham ver və inkişaf edin.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarClock} label="Bu həftəki sessiyalar" value={12} trend="+4 yeni" />
        <StatCard icon={Users} label="Ümumi sessiya" value={12} sub="Bu ay" />
        <StatCard icon={CheckCircle2} label="Tamamlanmış" value={16} sub="Bu ay" />
        <StatCard icon={Clock3} label="Gözləyən" value={4} sub="Təsdiqlənmə gözləyir" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-base font-semibold text-ink-900">Növbəti sessiya</h2>
          {!sessions && <Skeleton className="h-40 rounded-lg" />}
          {sessions && !nextSession && (
            <div className="rounded-lg border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-500">
              Hazırda planlaşdırılmış sessiyan yoxdur.
            </div>
          )}
          {nextSession && (
            <div className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white p-5 shadow-card sm:flex-row sm:items-center">
              <img src={nextSession.studentAvatarUrl} alt="" className="size-14 rounded-full object-cover" />
              <div className="flex-1">
                <p className="font-medium text-ink-900">{nextSession.studentName}</p>
                <p className="text-xs text-ink-500">{nextSession.studentTitle}</p>
                <p className="mt-1 text-sm text-ink-700">{nextSession.topic}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {nextSession.date} · {nextSession.timeRange}
                </p>
              </div>
              <Button asChild>
                <a href={nextSession.meetingLink} target="_blank" rel="noreferrer">
                  <Video className="size-4" /> Sessiyaya qoşul
                </a>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Link
            to="/mentor/earnings"
            className="flex items-center gap-3 rounded-lg border border-ink-100 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-success-50 text-success-600">
              <Wallet className="size-4.5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink-800">Qazanc</span>
              <span className="text-xs text-ink-500">Bu ay ₼1,500 qazandın</span>
            </span>
          </Link>
          <Link
            to="/mentor/reviews"
            className="flex items-center gap-3 rounded-lg border border-ink-100 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
          >
            <span className="flex size-10 items-center justify-center rounded-md bg-warning-50 text-warning-600">
              <Star className="size-4.5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium text-ink-800">Reytinq</span>
              <span className="text-xs text-ink-500">4.8 ortalama, 30 rəy</span>
            </span>
          </Link>
          <div className="flex items-start gap-3 rounded-lg border border-primary-100 bg-primary-50/60 p-4">
            <Sparkles className="mt-0.5 size-4.5 shrink-0 text-primary-500" />
            <p className="text-xs leading-relaxed text-primary-800">
              Profilini tam doldurmaq daha çox tələbənin sənə müraciət etmə ehtimalını artırır.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
