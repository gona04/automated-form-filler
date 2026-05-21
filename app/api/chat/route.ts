import { ai } from '@/lib/aiAdapter'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are a warm, professional career counsellor conducting a structured job preference interview.
- Ask exactly one question per turn. Never ask two questions at once.
- Wait for the user's reply before moving forward.
- Keep responses concise — one short paragraph maximum.
- Do not offer job advice, listings, or opinions during the interview.
- Use the user's name (from Q1) in subsequent messages.`

const asMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

export async function POST(req: Request): Promise<Response> {
  const { messages } = (await req.json()) as { messages: { role: 'user' | 'assistant'; content: string }[] }
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const token of ai.streamResponse(messages, SYSTEM_PROMPT)) controller.enqueue(encoder.encode(`data: ${token}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (error: unknown) {
        const message = asMessage(error)
        console.error('Chat stream error:', message)
        controller.enqueue(encoder.encode(`data: [ERROR] ${message}\n\n`))
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      }
      controller.close()
    },
  })

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } })
}
