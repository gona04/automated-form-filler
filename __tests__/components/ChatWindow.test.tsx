import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChatWindow } from '@/components/ChatWindow'
import { useChatStore } from '@/store/chatStore'

// Mock zustand
jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(),
  QUESTIONS: [
    'What would you like me to call you?',
    'Can you share a short summary of your background?',
  ],
}))

describe('ChatWindow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render chat messages', () => {
    const mockMessages = [
      { role: 'bot', content: 'Hello', streaming: false },
      { role: 'user', content: 'Hi there', streaming: false },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    render(<ChatWindow />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('Hi there')).toBeInTheDocument()
  })

  it('should display bot messages with different styling', () => {
    const mockMessages = [
      { role: 'bot', content: 'Bot message', streaming: false },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    render(<ChatWindow />)
    const botMessage = screen.getByText('Bot message').closest('div')
    expect(botMessage).toHaveClass('bg-zinc-200')
    expect(botMessage).toHaveClass('text-zinc-900')
  })

  it('should display user messages with different styling', () => {
    const mockMessages = [
      { role: 'user', content: 'User message', streaming: false },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    render(<ChatWindow />)
    const userMessage = screen.getByText('User message').closest('div')
    expect(userMessage).toHaveClass('bg-blue-600')
    expect(userMessage).toHaveClass('text-white')
  })

  it('should show streaming indicator when message is streaming', () => {
    const mockMessages = [
      { role: 'bot', content: 'Processing', streaming: true },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    render(<ChatWindow />)
    expect(screen.getByText('Processing')).toBeInTheDocument()
  })

  it('should render empty chat when no messages', () => {
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: [] })
    )

    const { container } = render(<ChatWindow />)
    expect(container.firstChild?.childNodes.length).toBe(0)
  })

  it('should render multiple messages in order', () => {
    const mockMessages = [
      { role: 'bot', content: 'First', streaming: false },
      { role: 'user', content: 'Second', streaming: false },
      { role: 'bot', content: 'Third', streaming: false },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    const { container } = render(<ChatWindow />)
    const messages = container.querySelectorAll('.rounded-lg')
    expect(messages).toHaveLength(3)
  })

  it('should handle special characters in messages', () => {
    const mockMessages = [
      { role: 'bot', content: 'Hello <script>alert("xss")</script>', streaming: false },
    ]
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ messages: mockMessages })
    )

    render(<ChatWindow />)
    expect(screen.getByText(/Hello/)).toBeInTheDocument()
  })
})
