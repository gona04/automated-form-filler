'use client'

import dynamic from 'next/dynamic'
import { sendMessage } from '@/lib/interview/flow'
import { useChatStore } from '@/store/chatStore'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SpeechButtonHandle } from './SpeechButton'

const SpeechButton = dynamic(() => import('./SpeechButton').then((mod) => mod.SpeechButton), { ssr: false })

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
