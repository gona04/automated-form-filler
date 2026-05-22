import { readSseText } from '@/lib/sse/parseStream'

const FALLBACK = 'Could you clarify a bit more so I can capture this accurately?'

export async function fetchClarifyingQuestion(question: string, answer: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'assistant', content: question },
        { role: 'user', content: answer },
        { role: 'user', content: 'Please ask one short clarifying follow-up question only.' },
      ],
    }),
  })

  if (!res.ok) throw new Error(`Clarifying question failed: ${res.status}`)
  if (!res.body) return FALLBACK

  const text = await readSseText(res.body)
  return text || FALLBACK
}
