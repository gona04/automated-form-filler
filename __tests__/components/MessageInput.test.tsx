import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageInput } from '@/components/MessageInput'
import * as sseClient from '@/lib/sseClient'

jest.mock('@/lib/sseClient')
jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(),
}))
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return () => <div data-testid="speech-button">Mock Speech Button</div>
  },
}))

describe('MessageInput Component', () => {
  const mockSendMessage = sseClient.sendMessage as jest.Mock
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }))
  })

  it('should render message input form', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    expect(screen.getByPlaceholderText('Type your answer...')).toBeInTheDocument()
  })

  it('should render send button', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument()
  })

  it('should disable send button when streaming', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: true,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const sendButton = screen.getByRole('button', { name: /Send/i })
    expect(sendButton).toBeDisabled()
  })

  it('should disable textarea when streaming', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: true,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...')
    expect(textarea).toBeDisabled()
  })

  it('should render error message when lastError is set', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: 'Network error',
      })
    )

    render(<MessageInput />)
    expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument()
  })

  it('should not render error message when lastError is empty', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument()
  })

  it('should render speech button', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    expect(screen.getByTestId('speech-button')).toBeInTheDocument()
  })

  it('should auto-resize textarea on input', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement

    await userEvent.type(textarea, 'This is a test message')
    expect(textarea.value).toBe('This is a test message')
  })

  it('should clear input after submission', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )
    mockSendMessage.mockResolvedValue(undefined)

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: /Send/i })

    await userEvent.type(textarea, 'Test message')
    fireEvent.click(sendButton)

    expect(textarea.value).toBe('')
    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith('Test message', expect.any(Function))
    })
  })

  it('should not submit empty message', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const sendButton = screen.getByRole('button', { name: /Send/i })

    fireEvent.click(sendButton)

    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should not submit whitespace-only message', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: /Send/i })

    await userEvent.type(textarea, '   ')
    fireEvent.click(sendButton)

    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('should call sendMessage with user input', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )
    mockSendMessage.mockResolvedValue(undefined)

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: /Send/i })

    await userEvent.type(textarea, 'Hello')
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(
        'Hello',
        expect.any(Function)
      )
    })
  })
})
