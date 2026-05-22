export const QUESTIONS = [
  'What would you like me to call you?',
  'Can you share a short summary of your background?',
  'What type of work environment helps you do your best work?',
  'Which industries or types of companies are you most interested in?',
  'What are your top priorities in your next role?',
  'Do you prefer remote, hybrid, or onsite work, and in which locations?',
  'What seniority level or scope of responsibility are you targeting?',
  'What timeline do you have for your next move?',
  'Are there any dealbreakers you want to avoid?',
  'Anything else you want recruiters or hiring managers to know?',
] as const

export const WELCOME_MESSAGE =
  "Welcome to JobFinder. I'll ask a short set of structured questions to build your profile."

export const closingMessage = (name: string): string =>
  `Thanks ${name || 'there'} — I have everything I need. Let me pull together your profile.`

const VAGUE_PHRASES = ['idk', "i don't know", 'not sure', 'n/a', 'none', 'whatever', 'skip'] as const

export const isUnclearAnswer = (text: string): boolean => {
  const normalized = text.trim().toLowerCase()
  if (normalized.length < 8) return true
  return VAGUE_PHRASES.some((phrase) => normalized === phrase || normalized.includes(phrase))
}
