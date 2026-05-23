import { ai } from '@/lib/aiAdapter'

export const runtime = 'nodejs'

const EXTRACT_PROMPT = `You are a structured data extractor.
Given the job interview conversation below, extract answers into a JSON object with EXACTLY these keys:
preferredName, backgroundSummary, workEnvironment, industryPreference,
workPriorities, locationPreference, targetLevel, timeline, dealbreakers, additionalNotes.

Rules:
- Return ONLY valid JSON. No explanation. No markdown. No code fences.
- If a field was not answered, use an empty string "".
- Summarise long answers into 1–2 clear sentences per field.`

export async function POST(req: Request): Promise<Response> {
  const { transcript } = (await req.json()) as { transcript: string }
  let text = ''
  for await (const token of ai.streamResponse([{ role: 'user', content: transcript }], EXTRACT_PROMPT)) text += token

  try {
    return Response.json(JSON.parse(text))
  } catch {
    return Response.json({ preferredName: '', backgroundSummary: '', workEnvironment: '', industryPreference: '', workPriorities: '', locationPreference: '', targetLevel: '', timeline: '', dealbreakers: '', additionalNotes: '' })
  }
}
