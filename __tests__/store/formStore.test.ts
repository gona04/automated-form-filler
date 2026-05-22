import { useFormStore } from '@/store/formStore'

describe('Form Store', () => {
  beforeEach(() => {
    useFormStore.setState({
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
      isLoading: false,
      error: '',
    })
  })

  describe('Initial State', () => {
    it('should initialize with empty form fields', () => {
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('')
      expect(state.backgroundSummary).toBe('')
      expect(state.workEnvironment).toBe('')
      expect(state.industryPreference).toBe('')
      expect(state.workPriorities).toBe('')
      expect(state.locationPreference).toBe('')
      expect(state.targetLevel).toBe('')
      expect(state.timeline).toBe('')
      expect(state.dealbreakers).toBe('')
      expect(state.additionalNotes).toBe('')
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setField', () => {
    it('should set a single field value', () => {
      const store = useFormStore.getState()
      store.setField('preferredName', 'John Doe')
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('John Doe')
    })

    it('should update backgroundSummary field', () => {
      const store = useFormStore.getState()
      store.setField('backgroundSummary', 'Software engineer with 5 years experience')
      const state = useFormStore.getState()
      expect(state.backgroundSummary).toBe('Software engineer with 5 years experience')
    })

    it('should update workEnvironment field', () => {
      const store = useFormStore.getState()
      store.setField('workEnvironment', 'Remote')
      const state = useFormStore.getState()
      expect(state.workEnvironment).toBe('Remote')
    })

    it('should update industryPreference field', () => {
      const store = useFormStore.getState()
      store.setField('industryPreference', 'Tech startups')
      const state = useFormStore.getState()
      expect(state.industryPreference).toBe('Tech startups')
    })

    it('should update workPriorities field', () => {
      const store = useFormStore.getState()
      store.setField('workPriorities', 'Work-life balance, learning opportunities')
      const state = useFormStore.getState()
      expect(state.workPriorities).toBe('Work-life balance, learning opportunities')
    })

    it('should update locationPreference field', () => {
      const store = useFormStore.getState()
      store.setField('locationPreference', 'San Francisco')
      const state = useFormStore.getState()
      expect(state.locationPreference).toBe('San Francisco')
    })

    it('should update targetLevel field', () => {
      const store = useFormStore.getState()
      store.setField('targetLevel', 'Senior Engineer')
      const state = useFormStore.getState()
      expect(state.targetLevel).toBe('Senior Engineer')
    })

    it('should update timeline field', () => {
      const store = useFormStore.getState()
      store.setField('timeline', 'ASAP')
      const state = useFormStore.getState()
      expect(state.timeline).toBe('ASAP')
    })

    it('should update dealbreakers field', () => {
      const store = useFormStore.getState()
      store.setField('dealbreakers', 'No fixed hours')
      const state = useFormStore.getState()
      expect(state.dealbreakers).toBe('No fixed hours')
    })

    it('should update additionalNotes field', () => {
      const store = useFormStore.getState()
      store.setField('additionalNotes', 'Available to start immediately')
      const state = useFormStore.getState()
      expect(state.additionalNotes).toBe('Available to start immediately')
    })

    it('should allow multiple field updates', () => {
      const store = useFormStore.getState()
      store.setField('preferredName', 'Jane')
      store.setField('backgroundSummary', 'Designer')
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('Jane')
      expect(state.backgroundSummary).toBe('Designer')
    })
  })

  describe('setAll', () => {
    it('should set multiple fields at once', () => {
      const store = useFormStore.getState()
      store.setAll({
        preferredName: 'John',
        backgroundSummary: 'Software engineer',
        workEnvironment: 'Remote',
      })
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('John')
      expect(state.backgroundSummary).toBe('Software engineer')
      expect(state.workEnvironment).toBe('Remote')
    })

    it('should set all fields at once', () => {
      const store = useFormStore.getState()
      const fullData = {
        preferredName: 'John Doe',
        backgroundSummary: 'Senior engineer',
        workEnvironment: 'Hybrid',
        industryPreference: 'Finance',
        workPriorities: 'Growth',
        locationPreference: 'NYC',
        targetLevel: 'Lead',
        timeline: '3 months',
        dealbreakers: 'None',
        additionalNotes: 'Open to relocate',
      }
      store.setAll(fullData)
      const state = useFormStore.getState()
      expect(state).toMatchObject(fullData)
    })

    it('should preserve other fields when setting partial data', () => {
      const store = useFormStore.getState()
      store.setField('preferredName', 'Jane')
      store.setAll({ backgroundSummary: 'Designer' })
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('Jane')
      expect(state.backgroundSummary).toBe('Designer')
    })
  })

  describe('Loading State', () => {
    it('should set loading to true', () => {
      const store = useFormStore.getState()
      store.setLoading(true)
      const state = useFormStore.getState()
      expect(state.isLoading).toBe(true)
    })

    it('should set loading to false', () => {
      const store = useFormStore.getState()
      store.setLoading(true)
      store.setLoading(false)
      const state = useFormStore.getState()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('Reset', () => {
    it('should reset all fields to empty strings', () => {
      const store = useFormStore.getState()
      store.setAll({
        preferredName: 'John',
        backgroundSummary: 'Engineer',
        workEnvironment: 'Remote',
        industryPreference: 'Tech',
        workPriorities: 'Growth',
        locationPreference: 'NYC',
        targetLevel: 'Senior',
        timeline: '1 month',
        dealbreakers: 'None',
        additionalNotes: 'Notes',
      })
      store.setLoading(true)
      store.reset()
      const state = useFormStore.getState()
      expect(state.preferredName).toBe('')
      expect(state.backgroundSummary).toBe('')
      expect(state.workEnvironment).toBe('')
      expect(state.industryPreference).toBe('')
      expect(state.workPriorities).toBe('')
      expect(state.locationPreference).toBe('')
      expect(state.targetLevel).toBe('')
      expect(state.timeline).toBe('')
      expect(state.dealbreakers).toBe('')
      expect(state.additionalNotes).toBe('')
      expect(state.isLoading).toBe(false)
    })
  })
})
