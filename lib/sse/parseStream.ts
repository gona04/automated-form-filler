/** Per SSE spec: strip only the single optional space after "data:", not token content. */
export const parseSseDataLine = (line: string): string | null => {
  if (!line.startsWith('data:')) return null
  const raw = line.slice(5)
  return raw.startsWith(' ') ? raw.slice(1) : raw
}

export const readSseText = async (body: ReadableStream<Uint8Array>): Promise<string> => {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let full = ''

  const consumeBuffer = (): void => {
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      for (const line of event.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const data = parseSseDataLine(trimmed)
        if (data === null) continue
        if (data === '[DONE]' || data.startsWith('[ERROR]')) continue
        full += data
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (value) {
      buffer += decoder.decode(value, { stream: true })
      consumeBuffer()
    }
    if (done) {
      consumeBuffer()
      break
    }
  }

  return full.trim()
}
