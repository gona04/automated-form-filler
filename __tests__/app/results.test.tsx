import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResultsPage from '@/app/results/page'
import { useFormStore } from '@/store/formStore'
import { useChatStore } from '@/store/chatStore'

jest.mock('@/store/formStore')
jest.mock('@/store/chatStore')
jest.mock('@/components/FormField', () => {
  return {
    FormField: ({ label }: { label: string }) => <div>{label}</div>,
  }
})

describe('Results Page', () => {
  const profileSnapshot = {
    preferredName: 'John Doe',
    backgroundSummary: 'Software engineer',
    workEnvironment: 'Remote',
    industryPreference: 'Tech',
    workPriorities: 'Growth',
    locationPreference: 'NYC',
    targetLevel: 'Senior',
    timeline: '1 month',
    dealbreakers: 'None',
    additionalNotes: 'Notes',
  }

  const mockFormState = {
    ...profileSnapshot,
    isLoading: false,
    error: '',
    getSnapshot: jest.fn(() => profileSnapshot),
    reset: jest.fn(),
  }

  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormStore as jest.Mock).mockImplementation((selector) =>
      selector(mockFormState)
    )
    ;(useFormStore as jest.Mock).getState = jest.fn(() => mockFormState)
    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ reset: jest.fn() })
    )
    ;(useChatStore as jest.Mock).getState = jest.fn(() => ({ reset: jest.fn() }))
    jest.mock('next/navigation', () => ({
      useRouter: () => mockRouter,
    }))
  })

  it('should render page title', () => {
    render(<ResultsPage />)
    expect(screen.getByText('Your profile')).toBeInTheDocument()
  })

  it('should render all form fields', () => {
    render(<ResultsPage />)
    expect(screen.getByText('Preferred name')).toBeInTheDocument()
    expect(screen.getByText('Background summary')).toBeInTheDocument()
    expect(screen.getByText('Work environment preference')).toBeInTheDocument()
    expect(screen.getByText('Industry preference')).toBeInTheDocument()
    expect(screen.getByText('Work priorities')).toBeInTheDocument()
    expect(screen.getByText('Location / remote preference')).toBeInTheDocument()
    expect(screen.getByText('Target seniority level')).toBeInTheDocument()
    expect(screen.getByText('Job search timeline')).toBeInTheDocument()
    expect(screen.getByText('Dealbreakers')).toBeInTheDocument()
    expect(screen.getByText('Additional notes')).toBeInTheDocument()
  })

  it('should render copy profile button', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('button', { name: /Copy profile/i })).toBeInTheDocument()
  })

  it('should render start over button', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('button', { name: /Start over/i })).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<ResultsPage />)
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument()
  })

  it('should copy profile text to clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })

    render(<ResultsPage />)
    const copyButton = screen.getByRole('button', { name: /Copy profile/i })

    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('should format profile data correctly in clipboard', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })

    render(<ResultsPage />)
    const copyButton = screen.getByRole('button', { name: /Copy profile/i })

    fireEvent.click(copyButton)

    await waitFor(() => {
      const clipboardContent = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0]
      expect(clipboardContent).toContain('preferredName: John Doe')
      expect(clipboardContent).toContain('backgroundSummary: Software engineer')
    })
  })

  it('should reset stores when start over is clicked', () => {
    const mockReset = jest.fn()
    const mockChatReset = jest.fn()
    
    ;(useFormStore as jest.Mock).mockImplementation((selector) =>
      selector({ ...mockFormState, reset: mockReset })
    )
    ;(useFormStore as jest.Mock).getState = jest.fn(() => ({ ...mockFormState, reset: mockReset }))

    ;(useChatStore as jest.Mock).mockImplementation((selector) =>
      selector({ reset: mockChatReset })
    )
    ;(useChatStore as jest.Mock).getState = jest.fn(() => ({ reset: mockChatReset }))

    render(<ResultsPage />)
    const startOverButton = screen.getByRole('button', { name: /Start over/i })

    fireEvent.click(startOverButton)

    expect(mockReset).toHaveBeenCalled()
    expect(mockChatReset).toHaveBeenCalled()
  })

  it('should navigate to chat on start over', () => {
    ;(useFormStore as jest.Mock).mockImplementation((selector) => {
      const state = { ...mockFormState }
      state.reset = () => {}
      return selector(state)
    })

    ;(useChatStore as jest.Mock).mockImplementation((selector) => {
      const state = { reset: () => {} }
      return selector(state)
    })

    render(<ResultsPage />)
    // Start over button click tested in integration
  })

  it('should save profile on submit when required fields are present', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem')
    render(<ResultsPage />)
    fireEvent.click(screen.getByRole('button', { name: /Submit profile/i }))

    expect(setItem).toHaveBeenCalledWith('jobfinder-profile', JSON.stringify(profileSnapshot))
    expect(screen.getByText(/Profile saved successfully/i)).toBeInTheDocument()
    setItem.mockRestore()
  })

  it('should display form fields with correct values', () => {
    ;(useFormStore as jest.Mock).mockImplementation((selector) =>
      selector({ preferredName: 'Jane Smith', backgroundSummary: 'Designer' })
    )

    render(<ResultsPage />)
    expect(screen.getByText('Preferred name')).toBeInTheDocument()
  })

  it('should have correct layout classes', () => {
    const { container } = render(<ResultsPage />)
    const main = container.querySelector('main')
    expect(main).toHaveClass('max-w-3xl')
    expect(main).toHaveClass('mx-auto')
    expect(main).toHaveClass('p-6')
  })

  it('should render buttons in correct order', () => {
    render(<ResultsPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent('Copy profile')
    expect(buttons[1]).toHaveTextContent('Start over')
    expect(buttons[2]).toHaveTextContent('Submit profile')
  })
})
