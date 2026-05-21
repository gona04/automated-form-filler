export interface AIAdapter {
  streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string>
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo'

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    const cause = typeof error.cause === 'string' ? error.cause : ''
    return `${error.name}: ${error.message}${cause ? ` | cause: ${cause}` : ''}`
  }
  return 'Unknown error'
}

const enrichProviderError = (status: number, bodyText: string, model: string): string => {
  const lowered = bodyText.toLowerCase()
  if (status === 404 && lowered.includes('model')) {
    return `Model '${model}' is not available for your account. Set OPENAI_MODEL to a model you have access to.`
  }
  if (status === 429) {
    return 'OpenAI rate limit reached. Retry later or increase your API limits.'
  }
  return ''
}

export class OpenAIAdapter implements AIAdapter {
  private model = DEFAULT_MODEL
  private apiKey = process.env.OPENAI_API_KEY
  private baseUrl = process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1'

  private async request(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): Promise<Response> {
    return fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })
  }

  async *streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string> {
    if (!this.apiKey) throw new Error('OPENAI_API_KEY is required')

    let response: Response
    try {
      response = await this.request(messages, systemPrompt)
    } catch (error: unknown) {
      throw new Error(`Network request to OpenAI failed. ${describeError(error)}`)
    }

    if (!response.ok || !response.body) {
      const bodyText = await response.text().catch(() => '')
      const safeBody = bodyText.slice(0, 300)
      const help = enrichProviderError(response.status, safeBody, this.model)
      throw new Error(`AI request failed: status=${response.status} statusText=${response.statusText}${safeBody ? ` body=${safeBody}` : ''}${help ? ` hint=${help}` : ''}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split('\n')
      buffer = chunks.pop() ?? ''

      for (const line of chunks) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') return
        const parsed = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] }
        const token = parsed.choices?.[0]?.delta?.content
        if (token) yield token
      }
    }
  }
}

export const ai: AIAdapter = new OpenAIAdapter()
