'use client'

import dynamic from 'next/dynamic'
import { sendMessage } from '@/lib/interview/flow'
import { useChatStore } from '@/store/chatStore'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SpeechButtonHandle } from './SpeechButton'


const SpeechButton = dynamic(
  () => import('./SpeechButton').then((mod) => mod.SpeechButton),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center flex-col gap-2">
        <button
          type="button"
          className="rounded-full border p-3 border-zinc-300 bg-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-zinc-700"
          >
            <rect
              x="8"
              y="2.5"
              width="8"
              height="13"
              rx="4"
            />
            <path d="M18 10.5a1 1 0 1 0-2 0 4 4 0 1 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V19H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.59a6 6 0 0 0 5-5.91Z" />
          </svg>
        </button>

        <span className="text-xs font-medium text-zinc-500">
          Mic off
        </span>
      </div>
    ),
  }
)

export function MessageInput() {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const lastError = useChatStore((s) => s.lastError)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const speechRef = useRef<SpeechButtonHandle | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resizeInput = (): void => {
    const input = inputRef.current
    if (!input) return
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, 160)}px`
  }

  useEffect(() => {
    resizeInput()
  }, [])

  const registerSpeech = useCallback((handle: SpeechButtonHandle) => {
    speechRef.current = handle
  }, [])

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const input = inputRef.current
    const value = input?.value.trim() ?? ''
    if (!value || isStreaming || isSubmitting) return

    if (input) {
      input.value = ''
      resizeInput()
    }

    speechRef.current?.stopRecording()
    setIsSubmitting(true)

    try {
      await sendMessage(value, () => router.push('/results'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBusy = isStreaming || isSubmitting

  return (
    <div className="border-t p-4 bg-white">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="space-y-2">
          <textarea
            ref={inputRef}
            id="chat-message-input"
            name="message"
            disabled={isBusy}
            rows={1}
            onInput={resizeInput}
            className="w-full min-h-10 max-h-40 resize-none overflow-y-auto rounded-md border px-3 py-2"
            placeholder="Type your answer..."
          />
        </div>
        <div className="h-px bg-zinc-200/70" />
        <div className="grid h-12 grid-cols-3 items-center">
          <div />
          <div className="flex justify-center">
            <SpeechButton inputId="chat-message-input" onReady={registerSpeech} />
          </div>
          <div className="flex justify-end">
            <button disabled={isBusy} className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50" type="submit">
              Send
            </button>
          </div>
        </div>
      </form>
      {lastError ? <p className="mt-2 text-sm text-red-600">Error: {lastError}</p> : null}
    </div>
  )
}
