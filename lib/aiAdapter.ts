export interface AIAdapter {
  streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string>
}

const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    const cause = typeof error.cause === 'string' ? error.cause : ''
    return `${error.name}: ${error.message}${cause ? ` | cause: ${cause}` : ''}`
  }
  return 'Unknown error'
}

export class HuggingFaceAdapter implements AIAdapter {
  private model = process.env.HF_MODEL_ID ?? 'mistralai/Mistral-7B-Instruct-v0.2'
  private apiKey = process.env.HF_API_KEY

  async *streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string> {
    if (!this.apiKey) throw new Error('HF_API_KEY is required')

    let response: Response
    try {
      response = await fetch(`https://api-inference.huggingface.co/models/${this.model}/v1/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          stream: true,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
        }),
      })
    } catch (error: unknown) {
      throw new Error(`Network request to Hugging Face failed. ${describeError(error)}`)
    }

    if (!response.ok || !response.body) {
      const bodyText = await response.text().catch(() => '')
      const safeBody = bodyText.slice(0, 200)
      throw new Error(`AI request failed: status=${response.status} statusText=${response.statusText}${safeBody ? ` body=${safeBody}` : ''}`)
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
