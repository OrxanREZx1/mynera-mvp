import { useState } from 'react'
import { MobilePageHeader } from '@/components/shared/MobilePageHeader'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

const settings = [
  { id: 'sessions', label: 'Sessiya xatırlatmaları', description: 'Yaxınlaşan mentor sessiyaları haqqında bildiriş al.' },
  { id: 'messages', label: 'Yeni mesajlar', description: 'Mentordan mesaj gələndə bildiriş al.' },
  { id: 'roadmap', label: 'Roadmap yenilikləri', description: 'Yeni modul və tapşırıqlar əlavə olunanda xəbərdar ol.' },
  { id: 'marketing', label: 'Yeniliklər və təkliflər', description: 'Platformadakı yeniliklər və endirimlər haqqında məlumat al.' },
  { id: 'email', label: 'E-poçt bildirişləri', description: 'Bildirişlərin surətini e-poçtuna da göndər.' },
]

export default function NotificationSettingsSection() {
  const [state, setState] = useState<Record<string, boolean>>({
    sessions: true,
    messages: true,
    roadmap: true,
    marketing: false,
    email: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <MobilePageHeader title="Bildiriş ayarları" />
      <div>
        <h2 className="text-lg font-semibold text-ink-900">Bildiriş ayarları</h2>
        <p className="text-sm text-ink-500">Hansı bildirişləri almaq istədiyini idarə et.</p>
      </div>

      <div className="rounded-lg border border-ink-100 bg-white shadow-card">
        {settings.map((setting, index) => (
          <div key={setting.id}>
            {index > 0 && <Separator />}
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-ink-800">{setting.label}</p>
                <p className="mt-0.5 text-xs text-ink-500">{setting.description}</p>
              </div>
              <Switch
                checked={state[setting.id]}
                onCheckedChange={(checked) => setState((prev) => ({ ...prev, [setting.id]: checked }))}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
