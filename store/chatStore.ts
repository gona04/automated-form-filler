import { QUESTIONS, WELCOME_MESSAGE } from '@/lib/interview/config'
import { create } from 'zustand'

export { QUESTIONS } from '@/lib/interview/config'

export type ChatRole = 'bot' | 'user'
export interface ChatMessage {
  role: ChatRole
  content: string
  streaming?: boolean
}

interface ChatStore {
  messages: ChatMessage[]
  currentQuestionIndex: number
  userName: string
  isStreaming: boolean
  isComplete: boolean
  lastError: string
  addUserMessage: (text: string) => void
  addBotMessage: (text: string) => void
  startBotMessage: () => void
  appendToken: (token: string) => void
  finaliseBotMessage: () => void
  setUserName: (name: string) => void
  advanceQuestion: () => void
  markComplete: () => void
  setError: (msg: string) => void
  clearError: () => void
  reset: () => void
}

const initialMessages: ChatMessage[] = [
  { role: 'bot', content: WELCOME_MESSAGE },
  { role: 'bot', content: QUESTIONS[0] },
]

export const useChatStore = create<ChatStore>((set) => ({
  messages: initialMessages,
  currentQuestionIndex: 0,
  userName: '',
  isStreaming: false,
  isComplete: false,
  lastError: '',
  addUserMessage: (text) => set((state) => ({ messages: [...state.messages, { role: 'user', content: text }] })),
  addBotMessage: (text) => set((state) => ({ messages: [...state.messages, { role: 'bot', content: text }] })),
  startBotMessage: () =>
    set((state) => ({
      isStreaming: true,
      messages: [...state.messages, { role: 'bot', content: '', streaming: true }],
    })),
  appendToken: (token) =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (!last || last.role !== 'bot') return state
      messages[messages.length - 1] = { ...last, content: `${last.content}${token}` }
      return { messages }
    }),
  finaliseBotMessage: () =>
    set((state) => {
      const messages = [...state.messages]
      const last = messages[messages.length - 1]
      if (last?.role === 'bot') messages[messages.length - 1] = { ...last, streaming: false }
      return { messages, isStreaming: false }
    }),
  setUserName: (name) => set({ userName: name.trim() }),
  advanceQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, QUESTIONS.length - 1),
    })),
  markComplete: () => set({ isComplete: true }),
  setError: (msg) => set({ lastError: msg }),
  clearError: () => set({ lastError: '' }),
  reset: () =>
    set({
      messages: initialMessages,
      currentQuestionIndex: 0,
      userName: '',
      isStreaming: false,
      isComplete: false,
      lastError: '',
    }),
}))
