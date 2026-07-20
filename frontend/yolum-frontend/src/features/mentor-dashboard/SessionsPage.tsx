import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, Clock3, Users, Video, XCircle } from 'lucide-react'
import { mentorDashboardApi } from '@/services/api/endpoints'
import type { MentorSession } from '@/types'
import { StatCard } from '@/components/shared/StatCard'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/EmptyState'

const statusMeta: Record<MentorSession['status'], { label: string; variant: 'warning' | 'default' | 'success' | 'danger' }> = {
  pending: { label: 'Gözləyən', variant: 'warning' },
  confirmed: { label: 'Təsdiqlənmiş', variant: 'default' },
  completed: { label: 'Tamamlanmış', variant: 'success' },
  cancelled: { label: 'Ləğv edilmiş', variant: 'danger' },
}

function SessionRow({ session }: { session: MentorSession }) {
  const meta = statusMeta[session.status]
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-4 shadow-card sm:flex-row sm:items-center">
      <img src={session.studentAvatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-ink-900">{session.topic}</p>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <p className="text-xs text-ink-500">
          {session.studentName} · {session.studentTitle}
        </p>
        <p className="mt-0.5 text-xs text-ink-400">
          {session.date} · {session.timeRange}
        </p>
      </div>
      {session.status === 'confirmed' && session.meetingLink && (
        <Button size="sm" asChild>
          <a href={session.meetingLink} target="_blank" rel="noreferrer">
            <Video className="size-3.5" /> Qoşul
          </a>
        </Button>
      )}
    </div>
  )
}

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<MentorSession[] | null>(null)

  useEffect(() => {
    mentorDashboardApi.sessions().then(setSessions)
  }, [])

  const byStatus = (status: MentorSession['status']) => sessions?.filter((s) => s.status === status) ?? []

  return (
    <div className="pb-16">
      <MobilePageHeader title="Seanslar" />
      <div className="container max-w-5xl py-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="hidden text-2xl font-semibold text-ink-900 lg:block">Sessiyalar</h1>
          <p className="text-sm text-ink-500">Bütün mentorluq sessiyalarınızı idarə edin və görüşlərinizi izləyin.</p>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={CalendarDays} label="Bu həftəki sessiyalar" value={12} sub="4 yeni sessiya" />
          <StatCard icon={Users} label="Ümumi sessiya" value={12} sub="Bu ay" />
          <StatCard icon={CheckCircle2} label="Tamamlanmış" value={16} sub="Bu ay" />
          <StatCard icon={Clock3} label="Gözləyən" value={4} sub="Təsdiqlənmə gözləyir" />
        </div>

        {!sessions && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}

        {sessions && (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Hamısı</TabsTrigger>
              <TabsTrigger value="pending">Gözləyən</TabsTrigger>
              <TabsTrigger value="confirmed">Təsdiqlənmiş</TabsTrigger>
              <TabsTrigger value="completed">Tamamlanmış</TabsTrigger>
              <TabsTrigger value="cancelled">Ləğv edilmiş</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="flex flex-col gap-3">
              {sessions.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </TabsContent>
            {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <TabsContent key={status} value={status} className="flex flex-col gap-3">
                {byStatus(status).length === 0 ? (
                  <EmptyState icon={XCircle} title="Bu kateqoriyada sessiya yoxdur" />
                ) : (
                  byStatus(status).map((s) => <SessionRow key={s.id} session={s} />)
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
