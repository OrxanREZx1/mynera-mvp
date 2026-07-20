import { useEffect, useState } from 'react'
import { notificationsApi } from '@/services/api/endpoints'
import type { Notification } from '@/types'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null)

  useEffect(() => {
    notificationsApi.list().then(setNotifications)
  }, [])

  return (
    <div className="pb-16">
      <MobilePageHeader title="Bildirişlər" />
      <div className="container max-w-2xl py-6 sm:py-10">
        <h1 className="mb-6 hidden text-2xl font-semibold text-ink-900 lg:block">Bildirişlər</h1>

        {!notifications && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        )}

        {notifications?.length === 0 && <EmptyState icon={Bell} title="Bildiriş yoxdur" description="Yeni bildirişlər burada görünəcək." />}

        <div className="flex flex-col gap-3">
          {notifications?.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex gap-3 rounded-lg border p-4 transition-colors',
                n.read ? 'border-ink-100 bg-white' : 'border-primary-200 bg-primary-50/50'
              )}
            >
              <span className="text-xl">{n.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink-900">{n.title}</p>
                <p className="mt-0.5 text-sm text-ink-600">{n.description}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {n.date} · {n.time}
                </p>
              </div>
              {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
