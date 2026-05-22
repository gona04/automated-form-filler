'use client'

import { FormField } from '@/components/FormField'
import type { FormFields } from '@/store/formStore'
import { useChatStore } from '@/store/chatStore'
import { useFormStore } from '@/store/formStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

const PROFILE_FIELDS = [
  ['Preferred name', 'preferredName', false],
  ['Background summary', 'backgroundSummary', true],
  ['Work environment preference', 'workEnvironment', false],
  ['Industry preference', 'industryPreference', false],
  ['Work priorities', 'workPriorities', false],
  ['Location / remote preference', 'locationPreference', false],
  ['Target seniority level', 'targetLevel', false],
  ['Job search timeline', 'timeline', false],
  ['Dealbreakers', 'dealbreakers', true],
  ['Additional notes', 'additionalNotes', true],
] as const satisfies ReadonlyArray<readonly [string, keyof FormFields, boolean]>

const REQUIRED_FOR_SUBMIT: (keyof FormFields)[] = ['preferredName', 'backgroundSummary']

export default function ResultsPage() {
  const router = useRouter()
  const [submitMessage, setSubmitMessage] = useState('')
  const { isLoading, error } = useFormStore(useShallow((s) => ({ isLoading: s.isLoading, error: s.error })))

  const copyProfile = async (): Promise<void> => {
    const formData = useFormStore.getState().getSnapshot()
    const text = Object.entries(formData)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
    setSubmitMessage('Profile copied to clipboard.')
  }

  const handleSubmit = (): void => {
    const snapshot = useFormStore.getState().getSnapshot()
    const missing = REQUIRED_FOR_SUBMIT.filter((key) => !snapshot[key].trim())
    if (missing.length > 0) {
      setSubmitMessage(`Please fill required fields: ${missing.join(', ')}`)
      return
    }

    sessionStorage.setItem('jobfinder-profile', JSON.stringify(snapshot))
    setSubmitMessage('Profile saved successfully. Ready to share with recruiters.')
  }

  const handleStartOver = (): void => {
    useFormStore.getState().reset()
    useChatStore.getState().reset()
    sessionStorage.removeItem('jobfinder-profile')
    router.push('/chat')
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your profile</h1>

      {isLoading ? <p className="text-sm text-zinc-600">Generating your profile…</p> : null}
      {error ? <p className="text-sm text-red-600">Error: {error}</p> : null}
      {submitMessage ? <p className="text-sm text-green-700">{submitMessage}</p> : null}

      <div className="space-y-3">
        {PROFILE_FIELDS.map(([label, key, multiline]) => (
          <FormField key={key} label={label} field={key} multiline={multiline} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded bg-zinc-800 text-white px-4 py-2" onClick={() => void copyProfile()}>
          Copy profile
        </button>
        <button type="button" className="rounded border px-4 py-2" onClick={handleStartOver}>
          Start over
        </button>
        <button type="button" className="rounded bg-blue-600 text-white px-4 py-2" onClick={handleSubmit}>
          Submit profile
        </button>
      </div>
    </main>
  )
}
