import { extractProfile } from '@/lib/nlpExtract'
import { useFormStore } from '@/store/formStore'

jest.mock('@/store/formStore', () => ({
  useFormStore: {
    getState: jest.fn(),
  },
}))

global.fetch = jest.fn()

describe('NLP Extract', () => {
  const mockSetLoading = jest.fn()
  const mockSetAll = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFormStore.getState as jest.Mock).mockReturnValue({
      setLoading: mockSetLoading,
      setAll: mockSetAll,
    })
  })

  it('should extract profile from transcript', async () => {
    const mockResponse = {
      preferredName: 'John',
      backgroundSummary: 'Engineer',
      workEnvironment: 'Remote',
      industryPreference: 'Tech',
      workPriorities: 'Growth',
      locationPreference: 'USA',
      targetLevel: 'Senior',
      timeline: '1 month',
      dealbreakers: 'None',
      additionalNotes: 'Notes',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const transcript = 'bot: Hello\nuser: Hi'
    await extractProfile(transcript)

    expect(mockSetLoading).toHaveBeenCalledWith(true)
    expect(mockSetLoading).toHaveBeenCalledWith(false)
    expect(mockSetAll).toHaveBeenCalledWith(mockResponse)
  })

  it('should set loading true before fetch', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    const transcript = 'test'
    await extractProfile(transcript)

    expect(mockSetLoading).toHaveBeenNthCalledWith(1, true)
  })

  it('should set loading false after fetch', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    const transcript = 'test'
    await extractProfile(transcript)

    expect(mockSetLoading).toHaveBeenNthCalledWith(2, false)
  })

  it('should set loading false on error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const transcript = 'test'
    try {
      await extractProfile(transcript)
    } catch {
      // Expected
    }

    expect(mockSetLoading).toHaveBeenCalledWith(false)
  })

  it('should call extract API endpoint', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    const transcript = 'test transcript'
    await extractProfile(transcript)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/extract',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('should send transcript in request body', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    const transcript = 'my transcript'
    await extractProfile(transcript)

    const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
    expect(callBody.transcript).toBe('my transcript')
  })

  it('should handle empty response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    })

    const transcript = 'test'
    await extractProfile(transcript)

    expect(mockSetAll).toHaveBeenCalledWith({})
  })

  it('should handle partial response', async () => {
    const partialResponse = {
      preferredName: 'Jane',
      backgroundSummary: 'Designer',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue(partialResponse),
    })

    const transcript = 'test'
    await extractProfile(transcript)

    expect(mockSetAll).toHaveBeenCalledWith(partialResponse)
  })

  it('should handle network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const transcript = 'test'
    await expect(extractProfile(transcript)).rejects.toThrow('Network error')

    expect(mockSetLoading).toHaveBeenCalledWith(false)
  })
})
