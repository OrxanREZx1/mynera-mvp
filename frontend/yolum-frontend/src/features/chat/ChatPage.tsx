import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Bot, Send, Sparkles } from 'lucide-react'
import { ChatBubble, TypingIndicator } from '@/components/shared/ChatBubble'
import type { ChatMessage } from '@/types'
import { chatApi } from '@/services/api/endpoints'
import { createId } from '@/utils/id'

function getApiError(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
  return detail || fallback
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true

    chatApi
      .history()
      .then((history) => {
        if (active) setMessages(history)
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(getApiError(requestError, 'Söhbət tarixçəsini yükləmək mümkün olmadı.'))
        }
      })
      .finally(() => {
        if (active) setIsLoadingHistory(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || isSending) return

    const history = messages
    const userMessage: ChatMessage = {
      id: createId('local-message'),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      pending: true,
    }

    setDraft('')
    setError(null)
    setIsSending(true)
    setMessages((current) => [...current, userMessage])

    try {
      const assistantMessage = await chatApi.sendMessage(content, history)
      setMessages((current) => [
        ...current.map((message) =>
          message.id === userMessage.id ? { ...message, pending: false } : message
        ),
        assistantMessage,
      ])
    } catch (requestError) {
      setMessages((current) =>
        current.map((message) =>
          message.id === userMessage.id ? { ...message, pending: false } : message
        )
      )
      setError(getApiError(requestError, 'Aira cavab verə bilmədi. Bir az sonra yenidən cəhd et.'))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col bg-ink-50/60 lg:h-screen">
      <header className="border-b border-ink-100 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Bot className="size-5" />
          </div>
          <div>
            <h1 className="font-semibold text-ink-900">Aira</h1>
            <p className="text-xs text-ink-500">AI karyera köməkçisi</p>
          </div>
        </div>
      </header>

      <main className="thin-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex min-h-full max-w-4xl flex-col">
          {isLoadingHistory ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-ink-500">
              <Sparkles className="size-4 animate-pulse text-primary-500" />
              Söhbət tarixçəsi yüklənir...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <Sparkles className="size-6" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-ink-900">Aira ilə söhbətə başla</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">
                IT karyerası, öyrənmə planı və texniki istiqamət haqqında sualını yaz.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isSending && <TypingIndicator />}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="safe-bottom border-t border-ink-100 bg-white px-4 py-4 sm:px-6">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            disabled={isLoadingHistory || isSending}
            rows={2}
            placeholder="Aira-ya sualını yaz..."
            aria-label="Aira-ya mesaj"
            className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isLoadingHistory || isSending}
            aria-label="Mesajı göndər"
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-5" />
          </button>
        </form>
      </footer>
    </div>
  )
}
