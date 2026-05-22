'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

type Props = {
  inputId: string
  onReady?: (handle: SpeechButtonHandle) => void
}

export type SpeechButtonHandle = { stopRecording: () => void }

const SILENCE_STOP_MS = 2000

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

export const SpeechButton = forwardRef<SpeechButtonHandle, Props>(function SpeechButton({ inputId, onReady }, ref) {
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<InstanceType<SpeechCtor> | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const acceptingResultsRef = useRef(false)

  const clearSilenceTimer = useCallback((): void => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    silenceTimerRef.current = null
  }, [])

  const stopRecording = useCallback((): void => {
    acceptingResultsRef.current = false
    clearSilenceTimer()
    const recognition = recognitionRef.current
    if (!recognition) {
      setIsRecording(false)
      return
    }
    recognition.onresult = null
    recognition.stop()
    setIsRecording(false)
  }, [clearSilenceTimer])

  useImperativeHandle(ref, () => ({ stopRecording }), [stopRecording])

  useEffect(() => {
    onReady?.({ stopRecording })
  }, [onReady, stopRecording])

  const speechWindow =
    typeof window === 'undefined' ? undefined : (window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor })
  const SpeechRecognition = speechWindow?.SpeechRecognition ?? speechWindow?.webkitSpeechRecognition

  const onClick = (): void => {
    if (recognitionRef.current && isRecording) {
      stopRecording()
      return
    }

    const input = document.getElementById(inputId) as HTMLTextAreaElement | null
    if (!input || !SpeechRecognition) return

    input.focus()

    const recognition = new SpeechRecognition()
    recognition.interimResults = true
    recognition.continuous = true

    let finalizedText = input.value.trim()
    acceptingResultsRef.current = true

    const scheduleAutoStop = (): void => {
      clearSilenceTimer()
      silenceTimerRef.current = setTimeout(() => recognition.stop(), SILENCE_STOP_MS)
    }

    recognition.onresult = (event) => {
      if (!acceptingResultsRef.current) return

      const interimSegments: string[] = []
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0]?.transcript?.trim()
        if (!transcript) continue
        if (event.results[i].isFinal) finalizedText = `${finalizedText} ${transcript}`.trim()
        else interimSegments.push(transcript)
      }

      const interimText = interimSegments.join(' ').trim()
      input.value = `${finalizedText} ${interimText}`.trim()
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.focus()
      input.setSelectionRange(input.value.length, input.value.length)
      scheduleAutoStop()
    }

    recognition.onerror = () => {
      clearSilenceTimer()
      acceptingResultsRef.current = false
      recognitionRef.current = null
      setIsRecording(false)
      input.focus()
    }

    recognition.onend = () => {
      clearSilenceTimer()
      acceptingResultsRef.current = false
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

  if (!SpeechRecognition) return null

  return (
    <div className="flex items-center flex-col gap-2">
      <button
        type="button"
        aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
        className={`rounded-full border p-3 transition ${isRecording ? 'border-red-600 bg-red-100 ring-2 ring-red-300' : 'border-zinc-300 bg-white hover:bg-zinc-50'}`}
        onClick={onClick}
      >
        <svg viewBox="0 0 24 24" className={`h-5 w-5 ${isRecording ? 'text-red-700' : 'text-zinc-700'}`} fill="currentColor" aria-hidden>
          <rect x="8" y="2.5" width="8" height="13" rx="4" />
          <path d="M18 10.5a1 1 0 1 0-2 0 4 4 0 1 1-8 0 1 1 0 1 0-2 0 6 6 0 0 0 5 5.91V19H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.59a6 6 0 0 0 5-5.91Z" />
        </svg>
      </button>
      {isRecording ? <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden /> : null}
      <span className={`text-xs font-medium ${isRecording ? 'text-red-600' : 'text-zinc-500'}`}>{isRecording ? 'Mic on' : 'Mic off'}</span>
    </div>
  )
})
