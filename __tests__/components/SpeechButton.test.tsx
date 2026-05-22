import { createRef } from 'react'
import { act, render, screen, fireEvent } from '@testing-library/react'
import { SpeechButton } from '@/components/SpeechButton'

describe('SpeechButton Component', () => {
  let mockInput: HTMLTextAreaElement
  let mockRecognition: any

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockInput = document.createElement('textarea')
    mockInput.id = 'chat-message-input'
    mockInput.value = ''
    document.body.appendChild(mockInput)

    mockRecognition = {
      interimResults: false,
      continuous: false,
      onresult: null,
      onerror: null,
      onend: null,
      start: jest.fn(),
      stop: jest.fn(),
    }

    ;(window as any).SpeechRecognition = jest.fn(() => mockRecognition)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    if (document.body.contains(mockInput)) {
      document.body.removeChild(mockInput)
    }
    delete (window as any).SpeechRecognition
    delete (window as any).webkitSpeechRecognition
  })

  it('should render speech button', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should show mic off initially', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    expect(screen.getByText('Mic off')).toBeInTheDocument()
  })

  it('should have correct aria-label for start', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Start voice input')
  })

  it('should start recording when button clicked', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Mic on')).toBeInTheDocument()
  })

  it('should show recording indicator', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const recordingIndicator = screen.getByText('Mic on').closest('div')
    expect(recordingIndicator?.querySelector('.bg-red-500')).toBeInTheDocument()
  })

  it('should update button styling when recording', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveClass('border-red-600')
    expect(button).toHaveClass('bg-red-100')
  })

  it('should change aria-label when recording', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-label', 'Stop voice input')
  })

  it('should stop recording when button clicked again', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Mic on')).toBeInTheDocument()

    fireEvent.click(button)
    act(() => {
      mockRecognition.onend?.()
    })

    expect(screen.getByText('Mic off')).toBeInTheDocument()
  })

  it('should set focus on input when starting recording', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(document.activeElement).toBe(mockInput)
  })

  it('should handle missing input element gracefully', () => {
    render(<SpeechButton inputId="non-existent-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Mic off')).toBeInTheDocument()
  })

  it('should render empty when SpeechRecognition not available', () => {
    delete (window as any).SpeechRecognition
    delete (window as any).webkitSpeechRecognition
    const { container } = render(<SpeechButton inputId="chat-message-input" />)
    const div = container.querySelector('div')
    if (div) {
      expect(div).toBeEmptyDOMElement()
    } else {
      // Component returns empty fragment when no SpeechRecognition
      expect(container.innerHTML).toBe('')
    }
  })

  it('should maintain recording state', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('Mic on')).toBeInTheDocument()
  })

  it('should have correct button type', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should call speech recognition start', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockRecognition.start).toHaveBeenCalled()
  })

  it('should call speech recognition stop when stopping', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mockRecognition.stop).toHaveBeenCalled()
  })

  it('should set interim results to true', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockRecognition.interimResults).toBe(true)
  })

  it('should set continuous to true', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(mockRecognition.continuous).toBe(true)
  })

  it('should stop recording when stopRecording is called via ref', () => {
    const ref = createRef<{ stopRecording: () => void }>()
    render(<SpeechButton ref={ref} inputId="chat-message-input" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Mic on')).toBeInTheDocument()

    act(() => {
      ref.current?.stopRecording()
    })

    expect(mockRecognition.stop).toHaveBeenCalled()
    expect(screen.getByText('Mic off')).toBeInTheDocument()
  })

  it('should not update input after stopRecording is called', () => {
    const ref = createRef<{ stopRecording: () => void }>()
    render(<SpeechButton ref={ref} inputId="chat-message-input" />)
    fireEvent.click(screen.getByRole('button'))

    act(() => {
      ref.current?.stopRecording()
    })

    mockInput.value = ''
    act(() => {
      mockRecognition.onresult?.({
        resultIndex: 0,
        results: { length: 1, 0: { 0: { transcript: 'late speech' }, isFinal: true } },
      })
    })

    expect(mockInput.value).toBe('')
  })

  it('should stop recording after 2 seconds of silence', () => {
    render(<SpeechButton inputId="chat-message-input" />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockRecognition.start).toHaveBeenCalled()

    jest.advanceTimersByTime(2000)

    expect(mockRecognition.stop).toHaveBeenCalled()
  })
})
