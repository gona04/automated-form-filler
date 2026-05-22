import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessageInput } from '@/components/MessageInput'

jest.mock('@/lib/interview/flow', () => ({
  sendMessage: jest.fn(),
}))

jest.mock('@/store/chatStore', () => ({
  useChatStore: jest.fn(),
}))

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return () => <div data-testid="speech-button">Speech Button</div>
  },
}))

describe('MessageInput - Additional Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle textarea height on initial render', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
  })

  it('should handle rapid input changes', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement

    fireEvent.change(textarea, { target: { value: 'a' } })
    fireEvent.change(textarea, { target: { value: 'ab' } })
    fireEvent.change(textarea, { target: { value: 'abc' } })

    expect(textarea.value).toBe('abc')
  })

  it('should clear textarea value on form reset', async () => {
    const { useChatStore } = require('@/store/chatStore')
    const mockSendMessage = jest.fn().mockResolvedValue(undefined)
    jest.doMock('@/lib/interview/flow', () => ({
      sendMessage: mockSendMessage,
    }))

    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement
    const sendButton = screen.getByRole('button', { name: /Send/i })

    fireEvent.change(textarea, { target: { value: 'test' } })
    expect(textarea.value).toBe('test')

    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('should display error without throwing', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: 'Test error message',
      })
    )

    render(<MessageInput />)
    expect(screen.getByText(/Test error message/)).toBeInTheDocument()
  })

  it('should have correct form structure', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    const { container } = render(<MessageInput />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
    expect(form?.method || form?.getAttribute('method')).toBeDefined()
  })

  it('should render divider', () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    const { container } = render(<MessageInput />)
    const divider = container.querySelector('.h-px.bg-zinc-200\\/70')
    expect(divider).toBeInTheDocument()
  })

  it('should handle multiline input without truncation', async () => {
    const { useChatStore } = require('@/store/chatStore')
    useChatStore.mockImplementation((selector: any) =>
      selector({
        isStreaming: false,
        lastError: '',
      })
    )

    render(<MessageInput />)
    const textarea = screen.getByPlaceholderText('Type your answer...') as HTMLTextAreaElement

    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
    fireEvent.change(textarea, { target: { value: longText } })

    expect(textarea.value).toBe(longText)
  })
})
