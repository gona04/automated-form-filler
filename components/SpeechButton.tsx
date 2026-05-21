'use client'

import { useRef, useState } from 'react'

type Props = { inputId: string }

type SpeechResult = {
  0?: { transcript?: string }
  isFinal?: boolean
}

type SpeechResultList = {
  length: number
  [index: number]: SpeechResult
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: SpeechResultList
}

type SpeechCtor = new () => {
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror?: (() => void) | null
  onend?: (() => void) | null
  start: () => void
  stop: () => void
}

export function SpeechButton({ inputId }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<InstanceType<SpeechCtor> | null>(null)
  const speechWindow = typeof window === 'undefined' ? undefined : (window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor })
  const SpeechRecognition = speechWindow?.SpeechRecognition ?? speechWindow?.webkitSpeechRecognition
  if (!SpeechRecognition) return <></>

  const onClick = (): void => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      return
    }

    const input = document.getElementById(inputId) as HTMLInputElement | null
    if (!input) return

    input.focus()

    const recognition = new SpeechRecognition()
    recognition.interimResults = true
    recognition.continuous = true

    let finalizedText = input.value.trim()
    let silenceTimer: ReturnType<typeof setTimeout> | null = null

    const scheduleAutoStop = (): void => {
      if (silenceTimer) clearTimeout(silenceTimer)
      silenceTimer = setTimeout(() => recognition.stop(), 4000)
    }

    recognition.onresult = (event) => {
      const interimSegments: string[] = []
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript?.trim()
        if (!transcript) continue
        if (event.results[i].isFinal) finalizedText = `${finalizedText} ${transcript}`.trim()
        else interimSegments.push(transcript)
      }

      const interimText = interimSegments.join(' ').trim()
      input.value = `${finalizedText} ${interimText}`.trim()
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
      scheduleAutoStop()
    }

    recognition.onerror = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      recognitionRef.current = null
      setIsRecording(false)
      input.focus()
    }

    recognition.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer)
      recognitionRef.current = null
      setIsRecording(false)
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
    }

    recognitionRef.current = recognition
    setIsRecording(true)
    recognition.start()
    scheduleAutoStop()
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
        className={`rounded-md border px-3 py-2 transition ${isRecording ? 'border-red-600 bg-red-100 ring-2 ring-red-300' : ''}`}
        onClick={onClick}
      >
        🎤
      </button>
      <span className={`text-xs font-medium ${isRecording ? 'text-red-600' : 'text-zinc-500'}`}>
        {isRecording ? 'Listening…' : 'Mic off'}
      </span>
      {isRecording ? <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden /> : null}
    </div>
  )
}
