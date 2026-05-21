'use client'

type Props = { inputId: string }

type SpeechCtor = new () => {
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { results: { 0?: { transcript?: string }; isFinal?: boolean }[] }) => void) | null
  onerror?: (() => void) | null
  onend?: (() => void) | null
  start: () => void
  stop: () => void
}

export function SpeechButton({ inputId }: Props) {
  const speechWindow = typeof window === 'undefined' ? undefined : (window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor })
  const SpeechRecognition = speechWindow?.SpeechRecognition ?? speechWindow?.webkitSpeechRecognition
  if (!SpeechRecognition) return <></>

  const onClick = (): void => {
    const input = document.getElementById(inputId) as HTMLInputElement | null
    if (!input) return

    const recognition = new SpeechRecognition()
    recognition.interimResults = true
    recognition.continuous = false

    let finalizedText = ''

    recognition.onresult = (event) => {
      const segments: string[] = []
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript?.trim()
        if (transcript) segments.push(transcript)
      }
      input.value = segments.join(' ')
    }

    recognition.onerror = () => {
      input.focus()
    }

    recognition.onend = () => {
      input.focus()
    }

    recognition.start()
    scheduleAutoStop()
  }

  return <button type="button" className="rounded-md border px-3 py-2" onClick={onClick}>🎤</button>
}
