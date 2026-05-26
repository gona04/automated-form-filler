import { extractProfile } from '@/lib/extractProfile'
import { fetchClarifyingQuestion } from '@/lib/interview/clarifying'
import { QUESTIONS, closingMessage, isUnclearAnswer } from '@/lib/interview/config'
import { useChatStore } from '@/store/chatStore'

const extractName = (text: string): string => {
  // handles "call me X" or "you can call me X"
  const callMe = text.match(/call me (\w+)/i)
  if (callMe) return callMe[1]

  // handles "my name is X"
  const myName = text.match(/my name is (\w+)/i)
  if (myName) return myName[1]

  // handles "I am X" or "I'm X"
  const iAm = text.match(/i'?m (\w+)|i am (\w+)/i)
  if (iAm) return iAm[1] || iAm[2]

  // fallback — first capitalised word
  const capitalised = text.match(/\b[A-Z][a-z]+\b/)
  if (capitalised) return capitalised[0]

  // last resort — just use whatever they typed trimmed
  return text.trim()
}

export async function sendMessage(userText: string, onComplete: () => void): Promise<void> {
  const store = useChatStore.getState()
  store.clearError()
  store.addUserMessage(userText)

  if (store.currentQuestionIndex === 0 && !store.userName) {
    store.setUserName(extractName(userText))
  }

  const { currentQuestionIndex } = useChatStore.getState()
  const currentQuestion = QUESTIONS[currentQuestionIndex]

  if (isUnclearAnswer(userText)) {
    try {
      useChatStore.getState().startBotMessage()
      const clarifyingQuestion = await fetchClarifyingQuestion(currentQuestion, userText)
      const latest = useChatStore.getState()
      latest.appendToken(clarifyingQuestion)
      latest.finaliseBotMessage()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get clarifying question'
      useChatStore.getState().setError(message)
      useChatStore.getState().finaliseBotMessage()
    }
    return
  }

  if (currentQuestionIndex >= QUESTIONS.length - 1) {
    const latest = useChatStore.getState()
    latest.markComplete()
    latest.addBotMessage(closingMessage(latest.userName))
    const transcript = latest.messages.map((m) => `${m.role}: ${m.content}`).join('\n')

    try {
      await extractProfile(transcript)
      onComplete()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to extract profile'
      useChatStore.getState().setError(message)
    }
    return
  }

  useChatStore.getState().advanceQuestion()
  const next = useChatStore.getState()
  next.addBotMessage(QUESTIONS[next.currentQuestionIndex])
}