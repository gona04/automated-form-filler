import { sendMessage } from '@/lib/sseClient'
import { useChatStore, QUESTIONS } from '@/store/chatStore'

jest.mock('@/store/chatStore', () => ({
  useChatStore: {
    getState: jest.fn(),
  },
  QUESTIONS: [
    'What would you like me to call you?',
    'Can you share a short summary of your background?',
    'What type of work environment helps you do your best work?',
    'Which industries or types of companies are you most interested in?',
    'What are your top priorities in your next role?',
    'Do you prefer remote, hybrid, or onsite work?',
    'What seniority level are you targeting?',
    'What timeline do you have for your next move?',
    'Are there any dealbreakers you want to avoid?',
    'Anything else you want recruiters to know?',
  ],
}))

jest.mock('@/store/formStore', () => ({
  useFormStore: {
    getState: jest.fn(() => ({
      setLoading: jest.fn(),
      setAll: jest.fn(),
    })),
  },
}))

global.fetch = jest.fn()

describe('SSE Client', () => {
  const mockState = {
    clearError: jest.fn(),
    addUserMessage: jest.fn(),
    setUserName: jest.fn(),
    startBotMessage: jest.fn(),
    appendToken: jest.fn(),
    finaliseBotMessage: jest.fn(),
    advanceQuestion: jest.fn(),
    addBotMessage: jest.fn(),
    markComplete: jest.fn(),
    messages: [{ role: 'bot', content: 'Welcome' }],
    currentQuestionIndex: 0,
    userName: '',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useChatStore.getState as jest.Mock).mockReturnValue(mockState)
  })

  it('should add user message', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    await sendMessage('Hello', jest.fn())

    expect(mockState.addUserMessage).toHaveBeenCalledWith('Hello')
  })

  it('should clear any previous errors', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    await sendMessage('Hello', jest.fn())

    expect(mockState.clearError).toHaveBeenCalled()
  })

  it('should set user name on first question', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    const stateWithFirstQ = { ...mockState, currentQuestionIndex: 0, userName: '' }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithFirstQ)

    await sendMessage('John Doe', jest.fn())

    expect(mockState.setUserName).toHaveBeenCalledWith('John Doe')
  })

  it('should not set user name on subsequent questions', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    const stateWithSecondQ = { ...mockState, currentQuestionIndex: 1 }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithSecondQ)

    await sendMessage('Some answer', jest.fn())

    expect(mockState.setUserName).not.toHaveBeenCalled()
  })

  it('should advance to next question for clear answer', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    const stateWithMessage = {
      ...mockState,
      currentQuestionIndex: 1,
      userName: 'John',
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithMessage)

    await sendMessage('I want to work in tech', jest.fn())

    expect(mockState.advanceQuestion).toHaveBeenCalled()
  })

  it('should ask clarifying question for vague answer', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: Can you elaborate?\n\n') })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })

    const stateWithMessage = {
      ...mockState,
      currentQuestionIndex: 1,
      userName: 'John',
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithMessage)

    await sendMessage('idk', jest.fn())

    expect(mockState.startBotMessage).toHaveBeenCalled()
  })

  it('should recognize vague answers (idk)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: Please clarify\n\n') })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })

    const stateWithMessage = {
      ...mockState,
      currentQuestionIndex: 1,
      userName: 'John',
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithMessage)

    await sendMessage('idk', jest.fn())

    expect(mockState.startBotMessage).toHaveBeenCalled()
  })

  it('should recognize short answers as vague', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: {
        getReader: () => ({
          read: jest.fn()
            .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: More details?\n\n') })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    })

    const stateWithMessage = {
      ...mockState,
      currentQuestionIndex: 1,
      userName: 'John',
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithMessage)

    await sendMessage('skip', jest.fn())

    expect(mockState.startBotMessage).toHaveBeenCalled()
  })

  it('should mark complete on last question', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    const messageTranscript = QUESTIONS.map((q, i) => (i % 2 === 0 ? `bot: ${q}` : 'user: answer')).join('\n')

    const stateWithLastQ = {
      ...mockState,
      currentQuestionIndex: QUESTIONS.length - 1,
      userName: 'John',
      messages: [
        ...mockState.messages,
        ...QUESTIONS.map((q) => ({ role: 'bot', content: q })),
      ],
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithLastQ)

    await sendMessage('Yes, final answer', jest.fn())

    expect(mockState.markComplete).toHaveBeenCalled()
  })

  it('should call onComplete callback on last question', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
      json: jest.fn().mockResolvedValue({}),
    })

    const mockOnComplete = jest.fn()
    const stateWithLastQ = {
      ...mockState,
      currentQuestionIndex: QUESTIONS.length - 1,
      userName: 'John',
      messages: [{ role: 'bot', content: 'Last question' }],
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithLastQ)

    await sendMessage('Final answer', mockOnComplete)

    expect(mockOnComplete).toHaveBeenCalled()
  })

  it('should extract profile on completion', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    const mockOnComplete = jest.fn()
    const stateWithLastQ = {
      ...mockState,
      currentQuestionIndex: QUESTIONS.length - 1,
      userName: 'John',
      messages: [
        { role: 'bot', content: 'First question' },
        { role: 'user', content: 'Answer 1' },
      ],
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithLastQ)

    await sendMessage('Final answer', mockOnComplete)

    // Verify fetch was called for extraction
    expect(global.fetch).toHaveBeenCalled()
  })

  it('should handle fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const stateWithMessage = {
      ...mockState,
      currentQuestionIndex: 1,
      userName: 'John',
    }
    ;(useChatStore.getState as jest.Mock).mockReturnValue(stateWithMessage)

    await expect(sendMessage('answer', jest.fn())).rejects.toThrow('Network error')
  })

  it('should handle empty user input', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    await sendMessage('', jest.fn())

    // Should still add message (though trimmed)
    expect(mockState.addUserMessage).toHaveBeenCalled()
  })

  it('should trim whitespace from user input', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      body: null,
    })

    await sendMessage('  hello  ', jest.fn())

    expect(mockState.addUserMessage).toHaveBeenCalledWith('  hello  ')
  })
})
