import { QUESTIONS, useChatStore } from '@/store/chatStore'

describe('Chat Store - Edge Cases', () => {
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

  describe('Multiple rapid operations', () => {
    it('should handle multiple consecutive message additions', () => {
      const store = useChatStore.getState()
      store.addUserMessage('Message 1')
      store.addBotMessage('Response 1')
      store.addUserMessage('Message 2')
      store.addBotMessage('Response 2')

      const state = useChatStore.getState()
      expect(state.messages.length).toBe(6) // Initial 2 + 4 new
    })

    it('should handle rapid token appends', () => {
      const store = useChatStore.getState()
      store.startBotMessage()
      store.appendToken('T')
      store.appendToken('e')
      store.appendToken('s')
      store.appendToken('t')

      const state = useChatStore.getState()
      const lastMsg = state.messages[state.messages.length - 1]
      expect(lastMsg.content).toBe('Test')
    })

    it('should handle rapid question advancement capped at max', () => {
      const store = useChatStore.getState()
      for (let i = 0; i < 20; i++) {
        store.advanceQuestion()
      }

      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(QUESTIONS.length - 1)
    })
  })

  describe('Empty and special values', () => {
    it('should handle empty string user name', () => {
      const store = useChatStore.getState()
      store.setUserName('')
      const state = useChatStore.getState()
      expect(state.userName).toBe('')
    })

    it('should handle very long user name', () => {
      const longName = 'A'.repeat(500)
      const store = useChatStore.getState()
      store.setUserName(longName)
      const state = useChatStore.getState()
      expect(state.userName).toBe(longName)
    })

    it('should handle special characters in user name', () => {
      const specialName = 'José María @#$%'
      const store = useChatStore.getState()
      store.setUserName(specialName)
      const state = useChatStore.getState()
      expect(state.userName).toBe(specialName)
    })

    it('should handle newlines in error message', () => {
      const errorMsg = 'Error\nOn\nMultiple\nLines'
      const store = useChatStore.getState()
      store.setError(errorMsg)
      const state = useChatStore.getState()
      expect(state.lastError).toBe(errorMsg)
    })
  })

  describe('State transitions', () => {
    it('should handle streaming -> not streaming transition', () => {
      const store = useChatStore.getState()
      store.startBotMessage()
      const stateAfterStart = useChatStore.getState()
      expect(stateAfterStart.isStreaming).toBe(true)
      store.finaliseBotMessage()
      const state = useChatStore.getState()
      expect(state.isStreaming).toBe(false)
    })

    it('should preserve message history through transitions', () => {
      const store = useChatStore.getState()
      const initialLength = store.messages.length
      store.addUserMessage('Test')
      store.startBotMessage()
      store.appendToken('Response')
      store.finaliseBotMessage()
      const state = useChatStore.getState()
      expect(state.messages.length).toBe(initialLength + 2)
    })

    it('should handle completion without affecting other state', () => {
      const store = useChatStore.getState()
      store.setUserName('John')
      store.setError('Some error')
      store.markComplete()
      const state = useChatStore.getState()
      expect(state.userName).toBe('John')
      expect(state.lastError).toBe('Some error')
      expect(state.isComplete).toBe(true)
    })
  })

  describe('Boundary conditions', () => {
    it('should handle advancing when at question 0', () => {
      useChatStore.setState({ currentQuestionIndex: 0 })
      const store = useChatStore.getState()
      store.advanceQuestion()
      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(1)
    })

    it('should handle advancing from last question', () => {
      useChatStore.setState({ currentQuestionIndex: QUESTIONS.length - 1 })
      const store = useChatStore.getState()
      store.advanceQuestion()
      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(QUESTIONS.length - 1)
    })

    it('should have exactly 10 questions', () => {
      expect(QUESTIONS.length).toBe(10)
    })

    it('should start with question index 0', () => {
      const state = useChatStore.getState()
      expect(state.currentQuestionIndex).toBe(0)
    })
  })

  describe('Reset consistency', () => {
    it('should reset to initial state completely', () => {
      const store = useChatStore.getState()
      store.addUserMessage('Test')
      store.setUserName('John')
      store.setError('Error')
      store.markComplete()
      store.startBotMessage()

      store.reset()

      const state = useChatStore.getState()
      expect(state.messages).toHaveLength(2)
      expect(state.userName).toBe('')
      expect(state.lastError).toBe('')
      expect(state.isComplete).toBe(false)
      expect(state.currentQuestionIndex).toBe(0)
      expect(state.isStreaming).toBe(false)
    })

    it('should allow operations after reset', () => {
      const store = useChatStore.getState()
      store.reset()
      store.addUserMessage('New message')

      const state = useChatStore.getState()
      expect(state.messages).toContainEqual(
        expect.objectContaining({ content: 'New message', role: 'user' })
      )
    })
  })
})
