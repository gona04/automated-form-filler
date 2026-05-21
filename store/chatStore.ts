import { create } from 'zustand'

export type ChatRole = 'bot' | 'user'
export interface ChatMessage { role: ChatRole; content: string; streaming?: boolean }

export const QUESTIONS = [
  'What would you like me to call you?',
  'Can you share a short summary of your background?',
  'What type of work environment helps you do your best work?',
  'Which industries or types of companies are you most interested in?',
  'What are your top priorities in your next role?',
  'Do you prefer remote, hybrid, or onsite work, and in which locations?',
  'What seniority level or scope of responsibility are you targeting?',
  'What timeline do you have for your next move?',
  'Are there any dealbreakers you want to avoid?',
  'Anything else you want recruiters or hiring managers to know?',
] as const

const welcomeMessage = "Welcome to JobFinder. I'll ask a short set of structured questions to build your profile."

interface ChatStore {
  messages: ChatMessage[]; currentQuestionIndex: number; userName: string; isStreaming: boolean; isComplete: boolean; lastError: string
  addUserMessage: (text: string) => void; addBotMessage: (text: string) => void; startBotMessage: () => void; appendToken: (token: string) => void; finaliseBotMessage: () => void
  setUserName: (name: string) => void; advanceQuestion: () => void; markComplete: () => void; setError: (msg: string) => void; clearError: () => void; reset: () => void
}

const initialMessages: ChatMessage[] = [{ role: 'bot', content: welcomeMessage }, { role: 'bot', content: QUESTIONS[0] }]

export const useChatStore = create<ChatStore>((set) => ({
  messages: initialMessages, currentQuestionIndex: 0, userName: '', isStreaming: false, isComplete: false, lastError: '',
  addUserMessage: (text) => set((state) => ({ messages: [...state.messages, { role: 'user', content: text }] })),
  addBotMessage: (text) => set((state) => ({ messages: [...state.messages, { role: 'bot', content: text }] })),
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
  advanceQuestion: () => set((state) => ({ currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, QUESTIONS.length - 1) })),
  markComplete: () => set({ isComplete: true }),
  setError: (msg) => set({ lastError: msg }),
  clearError: () => set({ lastError: '' }),
  reset: () => set({ messages: initialMessages, currentQuestionIndex: 0, userName: '', isStreaming: false, isComplete: false, lastError: '' }),
}))
