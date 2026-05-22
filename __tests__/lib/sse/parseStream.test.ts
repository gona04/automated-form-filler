import { parseSseDataLine, readSseText } from '@/lib/sse/parseStream'

describe('parseStream', () => {
  it('parseSseDataLine preserves leading spaces in token content', () => {
    expect(parseSseDataLine('data:  kinds')).toBe(' kinds')
    expect(parseSseDataLine('data: What')).toBe('What')
  })

  it('readSseText concatenates streamed chunks', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(encoder.encode('data: What\n\n'))
        controller.enqueue(encoder.encode('data:  kinds\n\n'))
        controller.close()
      },
    })

    await expect(readSseText(stream)).resolves.toBe('What kinds')
  })
})
