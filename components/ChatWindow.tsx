'use client'

import { memo } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useShallow } from 'zustand/react/shallow'

export const ChatWindow = memo(function ChatWindow() {
  const messages = useChatStore(useShallow((s) => s.messages))

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m, i) => (
        <div
          key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
          className={`max-w-3xl rounded-lg px-4 py-3 ${m.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-zinc-200 text-zinc-900'}`}
        >
          {m.content}
          {m.streaming ? <span className="animate-pulse">▍</span> : null}
        </div>
      ))}
    </div>
  )
})
