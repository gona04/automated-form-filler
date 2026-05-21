import { useFormStore } from '@/store/formStore'

export async function extractProfile(transcript: string): Promise<void> {
  const { setLoading, setAll } = useFormStore.getState()
  setLoading(true)
  try {
    const res = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) })
    const data = await res.json()
    setAll(data)
  } finally {
    setLoading(false)
  }
}
