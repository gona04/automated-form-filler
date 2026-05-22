import { isUnclearAnswer, QUESTIONS } from '@/lib/interview/config'

describe('interview config', () => {
  it('should expose 10 interview questions', () => {
    expect(QUESTIONS).toHaveLength(10)
  })

  it('should treat short answers as unclear', () => {
    expect(isUnclearAnswer('remote')).toBe(true)
  })

  it('should treat substantive answers as clear', () => {
    expect(isUnclearAnswer('I prefer hybrid work in Sydney with product teams')).toBe(false)
  })

  it('should treat vague phrases as unclear', () => {
    expect(isUnclearAnswer('idk')).toBe(true)
    expect(isUnclearAnswer("I'm not sure yet")).toBe(true)
  })
})
