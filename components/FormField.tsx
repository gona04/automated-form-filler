'use client'

import type { FormFields } from '@/store/formStore'
import { useFormStore } from '@/store/formStore'

type Props = { label: string; field: keyof FormFields; multiline?: boolean }

export function FormField({ label, field, multiline }: Props) {
  const value = useFormStore((s) => s[field])
  const setField = useFormStore((s) => s.setField)
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? <textarea rows={4} className="w-full rounded-md border px-3 py-2" value={value} onChange={(e) => setField(field, e.target.value)} /> : <input className="w-full rounded-md border px-3 py-2" type="text" value={value} onChange={(e) => setField(field, e.target.value)} />}
    </label>
  )
}
