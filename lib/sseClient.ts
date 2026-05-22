import { extractProfile } from '@/lib/nlpExtract'
import { QUESTIONS, useChatStore } from '@/store/chatStore'

const closing = (name: string) => `Thanks ${name || 'there'} — I have everything I need. Let me pull together your profile.`

/** Per SSE spec: strip only the single optional space after "data:", not token content. */
const parseSseDataLine = (line: string): string | null => {
  if (!line.startsWith('data:')) return null
  const raw = line.slice(5)
  return raw.startsWith(' ') ? raw.slice(1) : raw
}

const isUnclearAnswer = (text: string): boolean => {
  const normalized = text.trim().toLowerCase()
  if (normalized.length < 8) return true
  const vague = ['idk', "i don't know", 'not sure', 'n/a', 'none', 'whatever', 'skip']
  return vague.some((phrase) => normalized === phrase || normalized.includes(phrase))
}

const askClarifyingQuestion = async (question: string, answer: string): Promise<string> => {
  const payload = {
    messages: [
      { role: 'assistant', content: question },
      { role: 'user', content: answer },
      { role: 'user', content: 'Please ask one short clarifying follow-up question only.' },
    ],
  }
  const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!res.body) return `Could you clarify a bit more so I can capture this accurately?`

  const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ''; let full = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n'); buffer = events.pop() ?? ''
    for (const event of events) {
      const line = event.trim(); if (!line.startsWith('data:')) continue
      const data = parseSseDataLine(line)
      if (data === null) continue
      if (data === '[DONE]' || data.startsWith('[ERROR]')) continue
      full += data
    }
  }
  return full.trim() || 'Could you clarify a bit more so I can capture this accurately?'
}

export async function sendMessage(userText: string, onComplete: () => void): Promise<void> {
  const state = useChatStore.getState()
  state.clearError()
  state.addUserMessage(userText)
  if (state.currentQuestionIndex === 0 && !state.userName) state.setUserName(userText)

  const current = useChatStore.getState()
  const currentQuestion = QUESTIONS[current.currentQuestionIndex]

  if (isUnclearAnswer(userText)) {
    current.startBotMessage()
    const clarifyingQuestion = await askClarifyingQuestion(currentQuestion, userText)
    useChatStore.getState().appendToken(clarifyingQuestion)
    useChatStore.getState().finaliseBotMessage()
    return
  }

  if (current.currentQuestionIndex >= QUESTIONS.length - 1) {
    current.markComplete()
    current.addBotMessage(closing(current.userName))
    const transcript = current.messages.map((m) => `${m.role}: ${m.content}`).join('\n')
    await extractProfile(transcript)
    onComplete()
    return
  }

  current.advanceQuestion()
  const nextState = useChatStore.getState()
  nextState.addBotMessage(QUESTIONS[nextState.currentQuestionIndex])
}
