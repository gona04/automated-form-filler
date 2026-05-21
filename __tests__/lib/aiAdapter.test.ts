import { OpenAIAdapter } from '@/lib/aiAdapter'

describe('OpenAI Adapter', () => {
  let adapter: OpenAIAdapter
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should initialize with environment variables', () => {
    adapter = new OpenAIAdapter()
    expect(adapter).toBeInstanceOf(OpenAIAdapter)
  })

  it('should throw error when API key is missing', async () => {
    process.env.OPENAI_API_KEY = undefined
    adapter = new OpenAIAdapter()

    const messages = [{ role: 'user', content: 'Hello' }]
    const systemPrompt = 'Test'

    const generator = adapter.streamResponse(messages, systemPrompt)
    await expect(generator.next()).rejects.toThrow('OPENAI_API_KEY is required')
  })

  it('should use default model when not specified', () => {
    process.env.OPENAI_MODEL = undefined
    adapter = new OpenAIAdapter()
    expect(adapter).toBeInstanceOf(OpenAIAdapter)
  })

  it('should use custom base URL when provided', () => {
    process.env.OPENAI_BASE_URL = 'https://custom.openai.com/v1'
    adapter = new OpenAIAdapter()
    expect(adapter).toBeInstanceOf(OpenAIAdapter)
  })

  describe('streamResponse', () => {
    beforeEach(() => {
      adapter = new OpenAIAdapter()
      global.fetch = jest.fn()
    })

    it('should handle successful streaming response', async () => {
      const mockStream = new ReadableStream({
        enqueue(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'
            )
          )
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          )
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const tokens: string[] = []

      for await (const token of adapter.streamResponse(messages, 'Test')) {
        tokens.push(token)
      }

      expect(tokens).toContain('Hello')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      const messages = [{ role: 'user', content: 'Hello' }]
      const generator = adapter.streamResponse(messages, 'Test')

      await expect(generator.next()).rejects.toThrow('Network request to OpenAI failed')
    })

    it('should handle non-ok response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        body: null,
        text: jest.fn().mockResolvedValue('Server error'),
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const generator = adapter.streamResponse(messages, 'Test')

      await expect(generator.next()).rejects.toThrow()
    })

    it('should handle 404 model not found error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        body: null,
        text: jest.fn().mockResolvedValue('Model not found'),
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const generator = adapter.streamResponse(messages, 'Test')

      await expect(generator.next()).rejects.toThrow()
    })

    it('should handle rate limit error (429)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        body: null,
        text: jest.fn().mockResolvedValue('Rate limit exceeded'),
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const generator = adapter.streamResponse(messages, 'Test')

      await expect(generator.next()).rejects.toThrow()
    })

    it('should handle missing response body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: null,
        status: 200,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue(''),
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const generator = adapter.streamResponse(messages, 'Test')

      await expect(generator.next()).rejects.toThrow()
    })

    it('should handle empty chunks', async () => {
      const mockStream = new ReadableStream({
        enqueue(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: \n\n')
          )
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          )
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const tokens: string[] = []

      for await (const token of adapter.streamResponse(messages, 'Test')) {
        tokens.push(token)
      }

      expect(tokens).toHaveLength(0)
    })

    it('should handle multiple tokens', async () => {
      const mockStream = new ReadableStream({
        enqueue(controller) {
          controller.enqueue(
            new TextEncoder().encode(
              'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" "}}]}\n\ndata: {"choices":[{"delta":{"content":"World"}}]}\n\ndata: [DONE]\n\n'
            )
          )
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const tokens: string[] = []

      for await (const token of adapter.streamResponse(messages, 'Test')) {
        tokens.push(token)
      }

      expect(tokens).toEqual(['Hello', ' ', 'World'])
    })

    it('should include system message in request', async () => {
      const mockStream = new ReadableStream({
        enqueue(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          )
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const messages = [{ role: 'user', content: 'Hello' }]
      const systemPrompt = 'You are helpful'

      for await (const _ of adapter.streamResponse(messages, systemPrompt)) {
        // Consume generator
      }

      expect(global.fetch).toHaveBeenCalled()
      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      expect(callBody.messages[0].role).toBe('system')
      expect(callBody.messages[0].content).toBe('You are helpful')
    })

    it('should request streaming response', async () => {
      const mockStream = new ReadableStream({
        enqueue(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: [DONE]\n\n')
          )
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        body: mockStream,
      })

      const messages = [{ role: 'user', content: 'Hello' }]

      for await (const _ of adapter.streamResponse(messages, 'Test')) {
        // Consume generator
      }

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)
      expect(callBody.stream).toBe(true)
    })
  })
})
