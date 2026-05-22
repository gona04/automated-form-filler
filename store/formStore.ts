import { create } from 'zustand'

export interface FormFields {
  preferredName: string
  backgroundSummary: string
  workEnvironment: string
  industryPreference: string
  workPriorities: string
  locationPreference: string
  targetLevel: string
  timeline: string
  dealbreakers: string
  additionalNotes: string
}

interface FormStore extends FormFields {
  isLoading: boolean
  error: string
  setField: (key: keyof FormFields, value: string) => void
  setAll: (data: Partial<FormFields>) => void
  setLoading: (v: boolean) => void
  setError: (msg: string) => void
  getSnapshot: () => FormFields
  reset: () => void
}

const defaults: FormFields = {
  preferredName: '',
  backgroundSummary: '',
  workEnvironment: '',
  industryPreference: '',
  workPriorities: '',
  locationPreference: '',
  targetLevel: '',
  timeline: '',
  dealbreakers: '',
  additionalNotes: '',
}

export const useFormStore = create<FormStore>((set, get) => ({
  ...defaults,
  isLoading: false,
  error: '',
  setField: (key, value) => set({ [key]: value } as Pick<FormStore, keyof FormFields>),
  setAll: (data) => set(data),
  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
  getSnapshot: () => {
    const state = get()
    return {
      preferredName: state.preferredName,
      backgroundSummary: state.backgroundSummary,
      workEnvironment: state.workEnvironment,
      industryPreference: state.industryPreference,
      workPriorities: state.workPriorities,
      locationPreference: state.locationPreference,
      targetLevel: state.targetLevel,
      timeline: state.timeline,
      dealbreakers: state.dealbreakers,
      additionalNotes: state.additionalNotes,
    }
  },
  reset: () => set({ ...defaults, isLoading: false, error: '' }),
}))
