import { extractProfile } from '@/lib/nlpExtract'
import { useChatStore } from '@/store/chatStore'

const closing = (name: string) => `Thanks ${name || 'there'} — I have everything I need. Let me pull together your profile.`

export async function sendMessage(userText: string, onComplete: () => void): Promise<void> {
  const chat = useChatStore.getState()
  chat.addUserMessage(userText)
  if (chat.currentQuestionIndex === 0 && !chat.userName) chat.setUserName(userText)

  const updated = useChatStore.getState()
  updated.startBotMessage()

  const payload = { messages: updated.messages.filter((m) => !m.streaming).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })) }
  const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.body) return

  const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n'); buffer = events.pop() ?? ''
    for (const event of events) {
      const line = event.trim(); if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') {
        const state = useChatStore.getState(); state.finaliseBotMessage();
        if (state.currentQuestionIndex >= 9) {
          state.markComplete(); state.addUserMessage('')
          state.startBotMessage(); state.appendToken(closing(state.userName)); state.finaliseBotMessage()
          const transcript = state.messages.map((m) => `${m.role}: ${m.content}`).join('\n')
          await extractProfile(transcript); onComplete()
        } else state.advanceQuestion()
        return
      }
      useChatStore.getState().appendToken(data)
    }
  }
}
