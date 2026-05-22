# Automated Form Filler (JobFinder)

A conversational Next.js app that interviews users about job preferences, uses OpenAI for clarifying questions and profile extraction, and auto-fills a structured results form.

## Features

- Scripted 10-question interview with chat UI
- Voice input (Web Speech API) with mic auto-stop on send or 2s silence
- LLM clarifying questions when answers are vague
- Profile extraction to editable fields on `/results`
- Copy profile, submit (session persistence), and start over

## Tech stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Zustand** for client state
- **Tailwind CSS v4**
- **OpenAI** via Edge API routes (`/api/chat`, `/api/extract`)

## Getting started

```bash
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/chat`.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm test` | Jest unit tests |
| `npm run analyze` | Production bundle analysis (webpack) |

## Project structure

```
app/                 Routes and API handlers
components/          React UI
lib/
  interview/         Interview rules and flow (domain logic)
  sse/               SSE stream parsing
  aiAdapter.ts       OpenAI client adapter
  extractProfile.ts  Profile extraction client
store/               Zustand stores
__tests__/           Unit tests (mirrors lib/ and components/)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for data flow and optimization notes.

## Deployment

Deploy to Vercel (or any Node host). Set `OPENAI_API_KEY` in the project environment. Run Lighthouse on the **production** URL (not `next dev`) for accurate performance scores.

## Testing

```bash
npm test
npm run test:coverage
```

Interview flow tests live in `__tests__/lib/sseClient.test.ts` (legacy name; tests `sendMessage` from `lib/interview/flow.ts`).
