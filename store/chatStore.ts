import { create } from 'zustand'

export type ChatRole = 'bot' | 'user'
export interface ChatMessage { role: ChatRole; content: string; streaming?: boolean }

const QUESTIONS = 10
const welcomeMessage = "Welcome to JobFinder. I'm here to help match you with the right opportunities. Let's start with a few quick questions."
const firstQuestion = 'What would you like me to call you?'

interface ChatStore {
  messages: ChatMessage[]; currentQuestionIndex: number; userName: string; isStreaming: boolean; isComplete: boolean; lastError: string
  addUserMessage: (text: string) => void; startBotMessage: () => void; appendToken: (token: string) => void; finaliseBotMessage: () => void
  setUserName: (name: string) => void; advanceQuestion: () => void; markComplete: () => void; setError: (msg: string) => void; clearError: () => void; reset: () => void
}

const initialMessages: ChatMessage[] = [{ role: 'bot', content: welcomeMessage }, { role: 'bot', content: firstQuestion }]

export const useChatStore = create<ChatStore>((set) => ({
  messages: initialMessages, currentQuestionIndex: 0, userName: '', isStreaming: false, isComplete: false, lastError: '',
  addUserMessage: (text) => set((state) => ({ messages: [...state.messages, { role: 'user', content: text }] })),
  startBotMessage: () => set((state) => ({ isStreaming: true, messages: [...state.messages, { role: 'bot', content: '', streaming: true }] })),
  appendToken: (token) => set((state) => {
    const messages = [...state.messages]; const last = messages[messages.length - 1]
    if (!last || last.role !== 'bot') return state
    messages[messages.length - 1] = { ...last, content: `${last.content}${token}` }
    return { messages }
  }),
  finaliseBotMessage: () => set((state) => {
    const messages = [...state.messages]; const last = messages[messages.length - 1]
    if (last?.role === 'bot') messages[messages.length - 1] = { ...last, streaming: false }
    return { messages, isStreaming: false }
  }),
  setUserName: (name) => set({ userName: name.trim() }),
  advanceQuestion: () => set((state) => ({ currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, QUESTIONS - 1) })),
  markComplete: () => set({ isComplete: true }),
  setError: (msg) => set({ lastError: msg }),
  clearError: () => set({ lastError: '' }),
  reset: () => set({ messages: initialMessages, currentQuestionIndex: 0, userName: '', isStreaming: false, isComplete: false, lastError: '' }),
}))
