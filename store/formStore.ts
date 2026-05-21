import { create } from 'zustand'

export interface FormFields {
  preferredName: string; backgroundSummary: string; workEnvironment: string; industryPreference: string; workPriorities: string
  locationPreference: string; targetLevel: string; timeline: string; dealbreakers: string; additionalNotes: string
}

interface FormStore extends FormFields {
  isLoading: boolean; setField: (key: keyof FormFields, value: string) => void; setAll: (data: Partial<FormFields>) => void; setLoading: (v: boolean) => void; reset: () => void
}

const defaults: FormFields = { preferredName: '', backgroundSummary: '', workEnvironment: '', industryPreference: '', workPriorities: '', locationPreference: '', targetLevel: '', timeline: '', dealbreakers: '', additionalNotes: '' }

export const useFormStore = create<FormStore>((set) => ({
  ...defaults, isLoading: false,
  setField: (key, value) => set({ [key]: value } as Pick<FormStore, keyof FormFields>),
  setAll: (data) => set(data),
  setLoading: (v) => set({ isLoading: v }),
  reset: () => set({ ...defaults, isLoading: false }),
}))
