import type { FormFields } from '@/store/formStore'
import { useFormStore } from '@/store/formStore'

export async function extractProfile(transcript: string): Promise<void> {
  const { setLoading, setAll, setError } = useFormStore.getState()
  setLoading(true)
  setError('')

  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    })

    if (!res.ok) throw new Error(`Profile extraction failed: ${res.status}`)

    const data = (await res.json()) as Partial<FormFields>
    setAll(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to extract profile'
    setError(message)
    throw error
  } finally {
    setLoading(false)
  }
}
