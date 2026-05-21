import { useChatStore, QUESTIONS } from '@/store/chatStore'

describe('Chat Store', () => {
  beforeEach(() => {
    useChatStore.setState({
      messages: [
        { role: 'bot', content: "Welcome to JobFinder. I'll ask a short set of structured questions to build your profile." },
        { role: 'bot', content: QUESTIONS[0] },
      ],
      currentQuestionIndex: 0,
      userName: '',
      isStreaming: false,
      isComplete: false,
      lastError: '',
    })
  })

  describe('Initial State', () => {
    it('should initialize with welcome and first question', () => {
      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.messages[0].content).toContain('Welcome')
      expect(state.currentQuestionIndex).toBe(0)
      expect(state.userName).toBe('')
      expect(state.isStreaming).toBe(false)
      expect(state.isComplete).toBe(false)
      expect(state.lastError).toBe('')
    })

    it('should have 10 predefined questions', () => {
      expect(QUESTIONS).toHaveLength(10)
    })
  })

  describe('Message Management', () => {
    it('should add user message', () => {
      const store = useChatStore.getState()
      store.addUserMessage('Hello')
      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(3)
      expect(state.messages[2].role).toBe('user')
      expect(state.messages[2].content).toBe('Hello')
    })

    it('should add bot message', () => {
      const store = useChatStore.getState()
      store.addBotMessage('Hi there')
      const state = useChatStore.getState()
      expect(state.messages[state.messages.length - 1].role).toBe('bot')
      expect(state.messages[state.messages.length - 1].content).toBe('Hi there')
    })

    it('should start bot message with streaming flag', () => {
      const store = useChatStore.getState()
      store.startBotMessage()
      const state = useChatStore.getState()
      const lastMsg = state.messages[state.messages.length - 1]
      expect(lastMsg.role).toBe('bot')
      expect(lastMsg.content).toBe('')
      expect(lastMsg.streaming).toBe(true)
      expect(state.isStreaming).toBe(true)
    })

    it('should append token to streaming message', () => {
      const store = useChatStore.getState()
      store.startBotMessage()
      store.appendToken('Hello')
      store.appendToken(' world')
      const state = useChatStore.getState()
      const lastMsg = state.messages[state.messages.length - 1]
      expect(lastMsg.content).toBe('Hello world')
    })

    it('should not append token if last message is not from bot', () => {
      const store = useChatStore.getState()
      store.addUserMessage('Test')
      const currentState = useChatStore.getState()
      const lastMsg = currentState.messages[currentState.messages.length - 1]
      const prevContent = lastMsg.content
      store.appendToken('Should not appear')
      const state = useChatStore.getState()
      expect(state.messages[state.messages.length - 1].content).toBe(prevContent)
    })

    it('should finalize bot message', () => {
      const store = useChatStore.getState()
      store.startBotMessage()
      store.appendToken('Test message')
      store.finaliseBotMessage()
      const state = useChatStore.getState()
      const lastMsg = state.messages[state.messages.length - 1]
      expect(lastMsg.streaming).toBe(false)
      expect(state.isStreaming).toBe(false)
    })
  })

  describe('Question Management', () => {
    it('should advance question index', () => {
      const store = useChatStore.getState()
      expect(store.currentQuestionIndex).toBe(0)
      store.advanceQuestion()
      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(1)
    })

    it('should not advance beyond last question', () => {
      const store = useChatStore.getState()
      useChatStore.setState({ currentQuestionIndex: QUESTIONS.length - 1 })
      store.advanceQuestion()
      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(QUESTIONS.length - 1)
    })
  })

  describe('User Name Management', () => {
    it('should set user name', () => {
      const store = useChatStore.getState()
      store.setUserName('  John Doe  ')
      const state = useChatStore.getState()
      expect(state.userName).toBe('John Doe')
    })

    it('should trim user name', () => {
      const store = useChatStore.getState()
      store.setUserName('   Jane   ')
      const state = useChatStore.getState()
      expect(state.userName).toBe('Jane')
    })
  })

  describe('Completion Management', () => {
    it('should mark chat as complete', () => {
      const store = useChatStore.getState()
      expect(store.isComplete).toBe(false)
      store.markComplete()
      const state = useChatStore.getState()
      expect(state.isComplete).toBe(true)
    })
  })

  describe('Error Management', () => {
    it('should set error message', () => {
      const store = useChatStore.getState()
      store.setError('Something went wrong')
      const state = useChatStore.getState()
      expect(state.lastError).toBe('Something went wrong')
    })

    it('should clear error message', () => {
      const store = useChatStore.getState()
      store.setError('Error')
      store.clearError()
      const state = useChatStore.getState()
      expect(state.lastError).toBe('')
    })
  })

  describe('Reset', () => {
    it('should reset store to initial state', () => {
      const store = useChatStore.getState()
      store.addUserMessage('Test')
      store.setUserName('John')
      store.setError('Error')
      store.markComplete()
      store.reset()
      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.userName).toBe('')
      expect(state.lastError).toBe('')
      expect(state.isComplete).toBe(false)
      expect(state.currentQuestionIndex).toBe(0)
    })
  })
})
