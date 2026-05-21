'use client'

import { FormField } from '@/components/FormField'
import { useChatStore } from '@/store/chatStore'
import { useFormStore } from '@/store/formStore'
import { useRouter } from 'next/navigation'

const fields = [
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
] as const

export default function ResultsPage() {
  const router = useRouter()
  const preferredName = useFormStore((s) => s.preferredName)
  const backgroundSummary = useFormStore((s) => s.backgroundSummary)
  const workEnvironment = useFormStore((s) => s.workEnvironment)
  const industryPreference = useFormStore((s) => s.industryPreference)
  const workPriorities = useFormStore((s) => s.workPriorities)
  const locationPreference = useFormStore((s) => s.locationPreference)
  const targetLevel = useFormStore((s) => s.targetLevel)
  const timeline = useFormStore((s) => s.timeline)
  const dealbreakers = useFormStore((s) => s.dealbreakers)
  const additionalNotes = useFormStore((s) => s.additionalNotes)

  const copyProfile = async (): Promise<void> => {
    const formData = {
      preferredName,
      backgroundSummary,
      workEnvironment,
      industryPreference,
      workPriorities,
      locationPreference,
      targetLevel,
      timeline,
      dealbreakers,
      additionalNotes,
    }
    const text = Object.entries(formData).map(([key, value]) => `${key}: ${String(value)}`).join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <div className="space-y-3">
        {fields.map(([label, key, multiline]) => <FormField key={key} label={label} field={key} multiline={multiline} />)}
      </div>
      <div className="flex gap-2">
        <button className="rounded bg-zinc-800 text-white px-4 py-2" onClick={() => void copyProfile()}>Copy profile</button>
        <button className="rounded border px-4 py-2" onClick={() => { useFormStore.getState().reset(); useChatStore.getState().reset(); router.push('/chat') }}>Start over</button>
        <button className="rounded bg-blue-600 text-white px-4 py-2" onClick={() => console.log(useFormStore.getState())}>Submit</button>
      </div>
    </main>
  )
}
