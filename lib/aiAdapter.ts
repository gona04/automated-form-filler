export interface AIAdapter {
  streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string>
}

const DEFAULT_MODEL = process.env.HF_MODEL_ID ?? 'Qwen/Qwen2.5-7B-Instruct'

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    const cause = typeof error.cause === 'string' ? error.cause : ''
    return `${error.name}: ${error.message}${cause ? ` | cause: ${cause}` : ''}`
  }
  return 'Unknown error'
}

const isDnsResolutionIssue = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return message.includes('enotfound') || message.includes('dns') || message.includes('could not resolve') || message.includes('fetch failed')
}

const enrichProviderError = (status: number, bodyText: string, model: string): string => {
  const lowered = bodyText.toLowerCase()
  if (status === 400 && lowered.includes('model not supported by provider')) {
    return `Model '${model}' is not available on the selected Hugging Face provider endpoint. Set HF_MODEL_ID to a provider-supported chat model (for example: Qwen/Qwen2.5-7B-Instruct, meta-llama/Llama-3.1-8B-Instruct) or override HF_BASE_URL/HF_FALLBACK_BASE_URL.`
  }
  return ''
}

export class HuggingFaceAdapter implements AIAdapter {
  private model = DEFAULT_MODEL
  private apiKey = process.env.HF_API_KEY
  private baseUrl = process.env.HF_BASE_URL ?? 'https://api-inference.huggingface.co'
  private fallbackBaseUrl = process.env.HF_FALLBACK_BASE_URL ?? 'https://router.huggingface.co/hf-inference'

  private async request(baseUrl: string, messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): Promise<Response> {
    return fetch(`${baseUrl}/models/${this.model}/v1/chat/completions`, {
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
    if (!this.apiKey) throw new Error('HF_API_KEY is required')

    let response: Response
    try {
      response = await this.request(this.baseUrl, messages, systemPrompt)
    } catch (error: unknown) {
      if (isDnsResolutionIssue(error) && this.baseUrl !== this.fallbackBaseUrl) {
        try {
          response = await this.request(this.fallbackBaseUrl, messages, systemPrompt)
        } catch (fallbackError: unknown) {
          throw new Error(`Network request to Hugging Face failed on both primary (${this.baseUrl}) and fallback (${this.fallbackBaseUrl}). Primary: ${describeError(error)}. Fallback: ${describeError(fallbackError)}`)
        }
      } else {
        throw new Error(`Network request to Hugging Face failed. ${describeError(error)}`)
      }
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

export const ai: AIAdapter = new HuggingFaceAdapter()
