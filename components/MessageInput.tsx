'use client'

import dynamic from 'next/dynamic'
import { sendMessage } from '@/lib/sseClient'
import { useChatStore } from '@/store/chatStore'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

const SpeechButton = dynamic(() => import('./SpeechButton').then((mod) => mod.SpeechButton), { ssr: false })

const INPUT_ID = 'chat-message-input'

export function MessageInput() {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastError = useChatStore((s) => s.lastError)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const resizeInput = (): void => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }

  useEffect(() => {
    resizeInput()
  }, [])

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const input = document.getElementById(INPUT_ID) as HTMLTextAreaElement | null
    const value = input?.value.trim() ?? ''
    if (!value || isStreaming) return
    if (input) {
      input.value = ''
      resizeInput()
    }
    await sendMessage(value, () => router.push('/results'))
  }

  return (
    <div className="border-t p-4 bg-white">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="space-y-2">
          <textarea
            ref={inputRef}
            id={INPUT_ID}
            name="message"
            disabled={isStreaming}
            rows={1}
            onInput={resizeInput}
            className="w-full min-h-10 max-h-40 resize-none overflow-y-auto rounded-md border px-3 py-2"
            placeholder="Type your answer..."
          />
          <div className="flex justify-end">
            <button disabled={isStreaming} className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50" type="submit">Send</button>
          </div>
        </div>
        <div className="h-px bg-zinc-200/70" />
        <div className="flex h-12 items-center justify-center">
          <SpeechButton inputId={INPUT_ID} />
        </div>
      </form>
      {lastError ? <p className="mt-2 text-sm text-red-600">Error: {lastError}</p> : null}
    </div>
  )
}
