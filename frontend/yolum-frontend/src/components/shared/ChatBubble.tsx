import { useState } from 'react'
import { Bot, Check, Copy, RefreshCcw } from 'lucide-react'
import type { ChatMessage } from '@/types'
import { cn } from '@/utils/cn'

function formatContent(content: string) {
  // Lightweight markdown-ish rendering: fenced code blocks + bold + line breaks.
  const parts = content.split(/```([\s\S]*?)```/g)
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <pre key={i} className="my-2 overflow-x-auto rounded-md bg-ink-900 px-4 py-3 text-xs leading-relaxed text-ink-50">
          <code>{part.trim()}</code>
        </pre>
      )
    }
    return part.split('\n').map((line, j) => (
      <span key={`${i}-${j}`}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((seg, k) =>
          seg.startsWith('**') && seg.endsWith('**') ? (
            <strong key={k} className="font-semibold text-ink-900">
              {seg.slice(2, -2)}
            </strong>
          ) : (
            <span key={k}>{seg}</span>
          )
        )}
        {j < part.split('\n').length - 1 && <br />}
      </span>
    ))
  })
}

interface ChatBubbleProps {
  message: ChatMessage
  onRegenerate?: () => void
}

export function ChatBubble({ message, onRegenerate }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in-up">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary-500 px-4 py-3 text-sm text-white sm:max-w-[70%]">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Bot className="size-4" />
      </div>
      <div className="flex max-w-[85%] flex-col gap-1.5 sm:max-w-[75%]">
        <div className="rounded-2xl rounded-tl-md bg-ink-100 px-4 py-3 text-sm leading-relaxed text-ink-800">
          {formatContent(message.content)}
        </div>
        <div className="flex items-center gap-1 pl-1">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
              <RefreshCcw className="size-3.5" />
              Yenidən yarat
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Bot className="size-4" />
      </div>
      <div className={cn('flex items-center gap-1 rounded-2xl rounded-tl-md bg-ink-100 px-4 py-3.5')}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-ink-400 animate-typing-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
