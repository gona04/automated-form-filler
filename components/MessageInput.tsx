'use client'

import { sendMessage } from '@/lib/sseClient'
import { useChatStore } from '@/store/chatStore'
import { useRouter } from 'next/navigation'
import { SpeechButton } from './SpeechButton'

const INPUT_ID = 'chat-message-input'

export function MessageInput() {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const router = useRouter()

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const input = document.getElementById(INPUT_ID) as HTMLInputElement | null
    const value = input?.value.trim() ?? ''
    if (!value || isStreaming) return
    if (input) input.value = ''
    await sendMessage(value, () => router.push('/results'))
  }

  return (
    <form onSubmit={onSubmit} className="border-t p-4 flex gap-2 bg-white">
      <input id={INPUT_ID} name="message" disabled={isStreaming} className="flex-1 rounded-md border px-3 py-2" placeholder="Type your answer..." />
      <SpeechButton inputId={INPUT_ID} />
      <button disabled={isStreaming} className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50" type="submit">Send</button>
    </form>
  )
}
