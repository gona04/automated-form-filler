'use client'

type Props = { inputId: string }

type SpeechCtor = new () => {
  interimResults: boolean
  continuous: boolean
  onresult: ((event: { resultIndex: number; results: { 0?: { transcript?: string }; isFinal?: boolean }[] }) => void) | null
  start: () => void
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
    recognition.onresult = (event) => {
      let text = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) text += event.results[i][0]?.transcript ?? ''
      input.value = text
    }
    recognition.start()
  }

  return <button type="button" className="rounded-md border px-3 py-2" onClick={onClick}>🎤</button>
}
