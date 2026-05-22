# Architecture

## Overview

JobFinder is a Next.js App Router app that runs a **scripted interview** (10 fixed questions), uses the LLM only for **clarifying follow-ups** and **final profile extraction**, and renders an editable results form.

## Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI (components/, app/*/page.tsx)                       │
│  - ChatWindow, MessageInput, FormField                  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  State (store/)                                         │
│  - chatStore: messages, question index, errors            │
│  - formStore: extracted profile fields                    │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Domain (lib/interview/)                                │
│  - config: questions, vague-answer rules                  │
│  - flow: sendMessage orchestration                        │
│  - clarifying: LLM follow-up via /api/chat              │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  Infrastructure (lib/)                                  │
│  - aiAdapter: OpenAI streaming (server)                   │
│  - extractProfile: /api/extract client                    │
│  - sse/parseStream: SSE parsing (shared)                  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│  API routes (app/api/) — Edge runtime                     │
│  - POST /api/chat                                       │
│  - POST /api/extract                                    │
└─────────────────────────────────────────────────────────┘
```

## Request flow (happy path)

1. User answers on `/chat` → `MessageInput` calls `sendMessage()` once (submit, not per keystroke).
2. `lib/interview/flow.ts` appends the user message and either:
   - asks a clarifying question (LLM), or
   - advances to the next scripted question, or
   - on the last question, calls `extractProfile()` then navigates to `/results`.
3. `extractProfile` POSTs the transcript to `/api/extract`; OpenAI returns JSON mapped into `formStore`.

## Performance choices

| Optimization | Where | Why |
|--------------|-------|-----|
| `next/dynamic` for `SpeechButton` | `MessageInput` | Keeps speech APIs off the initial `/chat` bundle |
| `memo` + `useShallow` | `ChatWindow`, `ResultsPage` | Fewer re-renders when unrelated store fields change |
| Submit-on-send only | `MessageInput` | No API calls per keystroke |
| Production minification | `next build` | Default; analyze with `npm run analyze` |
| Edge API routes | `app/api/*` | Low latency for short LLM calls |

## Environment

Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` before running LLM features.
