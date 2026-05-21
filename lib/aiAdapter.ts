export interface AIAdapter {
  streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string>
}

export class HuggingFaceAdapter implements AIAdapter {
  private model = process.env.HF_MODEL_ID ?? 'mistralai/Mistral-7B-Instruct-v0.2'
  private apiKey = process.env.HF_API_KEY

  async *streamResponse(messages: { role: 'user' | 'assistant'; content: string }[], systemPrompt: string): AsyncGenerator<string> {
    if (!this.apiKey) throw new Error('HF_API_KEY is required')

    const response = await fetch(`https://api-inference.huggingface.co/models/${this.model}/v1/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: true,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })

    if (!response.ok || !response.body) throw new Error(`AI request failed: ${response.status}`)

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
