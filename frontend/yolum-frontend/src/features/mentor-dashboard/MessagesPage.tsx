import { useState } from 'react'
import { ChevronLeft, Search, Send } from 'lucide-react'
import { createId } from '@/utils/id'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface Thread {
  id: string
  name: string
  title: string
  avatarUrl: string
  lastMessage: string
  time: string
  unread?: boolean
  messages: { id: string; fromMe: boolean; content: string; time: string }[]
}

const threads: Thread[] = Array.from({ length: 5 }).map((_, i) => ({
  id: `t${i}`,
  name: 'Aysel Məmmədli',
  title: 'Frontend developer',
  avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
  lastMessage: 'Salam müəllim. Ümid edirəm yaxşısınız.',
  time: i === 0 ? '12:23' : '',
  unread: i < 2,
  messages: [
    {
      id: 'm1',
      fromMe: false,
      content:
        'Salam müəllim. Ümid edirəm yaxşısınız. Tapşırıqları yerinə yetirməyə çalışıram, amma bəzi mövzularda çətinlik çəkirəm. Mümkünsə, mənə qısa istiqamət verə bilərsiniz? Həmçinin, növbəti addımlar barədə də məsləhətinizi almaq istərdim. Təşəkkür edirəm.',
      time: '12:23',
    },
  ],
}))

export default function MentorMessagesPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [extraMessages, setExtraMessages] = useState<Record<string, Thread['messages']>>({})

  const active = threads.find((t) => t.id === activeId)
  const filtered = threads.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  const handleSend = () => {
    if (!draft.trim() || !active) return
    setExtraMessages((prev) => ({
      ...prev,
      [active.id]: [...(prev[active.id] ?? []), { id: createId('msg'), fromMe: true, content: draft, time: 'indi' }],
    }))
    setDraft('')
  }

  const listPanel = (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100 p-4">
        <Input placeholder="Axtar" leftIcon={<Search className="size-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {filtered.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={cn(
              'flex w-full items-start gap-3 border-b border-ink-50 px-4 py-3.5 text-left transition-colors hover:bg-ink-50',
              activeId === t.id && 'bg-primary-50'
            )}
          >
            <img src={t.avatarUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-ink-900">{t.name}</p>
                {t.time && <span className="shrink-0 text-xs text-ink-400">{t.time}</span>}
              </div>
              <p className="text-xs text-ink-400">{t.title}</p>
              <p className="truncate text-xs text-ink-500">{t.lastMessage}</p>
            </div>
            {t.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary-500" />}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen">
      <aside className={cn('w-full shrink-0 border-r border-ink-100 bg-white lg:block lg:w-80', active && 'hidden lg:block')}>
        <div className="hidden h-14 items-center border-b border-ink-100 px-4 lg:flex">
          <h1 className="text-base font-semibold text-ink-900">Mesajlar</h1>
        </div>
        {listPanel}
      </aside>

      <div className={cn('flex flex-1 min-w-0 flex-col', !active && 'hidden lg:flex')}>
        {active ? (
          <>
            <div className="flex h-14 shrink-0 items-center gap-3 border-b border-ink-100 px-4">
              <button onClick={() => setActiveId(null)} className="text-ink-500 hover:text-ink-800 lg:hidden">
                <ChevronLeft className="size-5" />
              </button>
              <img src={active.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-ink-900">{active.name}</p>
                <p className="text-xs text-ink-400">{active.title}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4 thin-scrollbar">
              {[...active.messages, ...(extraMessages[active.id] ?? [])].map((m) => (
                <div key={m.id} className={cn('flex', m.fromMe ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[65%]',
                      m.fromMe ? 'rounded-tr-md bg-primary-500 text-white' : 'rounded-tl-md bg-ink-100 text-ink-800'
                    )}
                  >
                    {m.content}
                    <span className={cn('mt-1 block text-[10px]', m.fromMe ? 'text-white/70' : 'text-ink-400')}>{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex shrink-0 items-center gap-2 border-t border-ink-100 p-3"
            >
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nəsə yazın..." className="flex-1" />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-sm text-ink-400 lg:flex">
            Söhbətə başlamaq üçün tələbə seç
          </div>
        )}
      </div>
    </div>
  )
}
