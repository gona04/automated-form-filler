import { render, screen } from '@testing-library/react'
import ChatPage from '@/app/chat/page'
import { ChatWindow } from '@/components/ChatWindow'
import { MessageInput } from '@/components/MessageInput'

jest.mock('@/components/ChatWindow', () => ({
  ChatWindow: jest.fn(() => <div data-testid="chat-window">Chat Window</div>),
}))
jest.mock('@/components/MessageInput', () => ({
  MessageInput: jest.fn(() => <div data-testid="message-input">Message Input</div>),
}))

describe('Chat Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render chat window component', () => {
    render(<ChatPage />)
    expect(screen.getByTestId('chat-window')).toBeInTheDocument()
  })

  it('should render message input component', () => {
    render(<ChatPage />)
    expect(screen.getByTestId('message-input')).toBeInTheDocument()
  })

  it('should render in correct layout structure', () => {
    const { container } = render(<ChatPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('h-screen')
    expect(main).toHaveClass('flex')
    expect(main).toHaveClass('flex-col')
  })

  it('should have correct styling classes', () => {
    const { container } = render(<ChatPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('bg-zinc-50')
  })
})
