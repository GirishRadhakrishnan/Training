# CLAUDE.md
Project memory. Also read PLAN.md (what to build) and GIT.md (branches).
## What this is
4-day React 19 + TypeScript training (4 x 90 min) for developers new to React. One file per topic. Ends with a small Employee Leave Tracker app.
## Stack
React 19.2.7+, TypeScript strict, Vite 7+, Node 22.22+. Added on later days: TanStack Query v5 (Day 3), React Router v8 (Day 4).
Plain CSS only. Not used on purpose: Tailwind, UI libraries, testing, Zod, Redux Toolkit, Zustand.
## Branches
day1 -> day2 -> day3 -> day4, cumulative. The final project (Employee leave management Basic) is a separate project outside this repo. Never put later-day code on an earlier branch.
## Commands
npm install (after every branch switch) | npm run dev | npm run build (tsc --noEmit && vite build; must pass on every branch)
## Layout
src/TopicBrowser.tsx auto-discovers src/topics/Day*/Topic*.tsx via import.meta.glob. src/sample/leaves.ts = static data (Day 1-2).
## Topic file rules
1. Name: Topic<n>-<PascalHeading>.tsx, numbered per day (src/topics/Day2/Topic6-UseEffect.tsx). TopicBrowser parses this pattern.
2. Self-contained, runnable, default-exports a component.
3. Starts with "// DAY n · TOPIC m: <title>" then 5-15 lines of plain explanation for trainees.
4. Ends with <p className="try">Try it: ...</p> (one small exercise).
5. One idea per file, usually 40-120 lines. Add the topic to PLAN.md.
## Conventions (follow and teach)
Function components and hooks only (class components only for the Day 2 awareness topic and error boundaries). Hooks first, early returns after.
No useMemo/useCallback by default; compute derived values during render. React 19 style: ref as a normal prop, <Context value>.
Server data lives in TanStack Query and is never copied into useState or a store. Invalidate in onSettled after mutations.
Context only for small rarely-changing values. Router v8 is taught on Day 4: import from "react-router" (never react-router-dom).
Auth: client guards (RequireAuth, RequireRole, hidden buttons) are UX only, the server enforces. Never store passwords; the token is the only secret kept (memory + sessionStorage for the demo). Never log tokens or passwords. Context holds the auth user only.
Every data screen has loading, error (with Retry) and empty states in specific language. Forms: controlled inputs, labels, aria-invalid.
Balances, counts and working days are calculated, never stored. TypeScript strict, prefer `type`, sentence-case UI text, plain visual design.
## Definition of done
npm run build passes; change rebased onto later branches; topic follows the rules; PLAN.md updated; no node_modules/dist/secrets committed.
## Day 3 additions (server state and CRUD, 9 topics)
Mock REST API is a Vite plugin in vite.config.ts (in memory, /api/leaves, ?delay ?fail ?empty); fetch helpers in src/api/leaves.ts check response.ok and throw ApiError. QueryClientProvider is in src/main.tsx (retry: false).
## Day 4 additions (routing, auth)
Mock API is server/mockApi.ts (loaded by vite.config.ts): /api/demo/leaves (open, Day 3), /api/login, /api/me, secured /api/leaves. Demo users are fake. src/api/http.ts holds the token, ApiError(status) and the global 401 handler.
Topic demos use MemoryRouter, never BrowserRouter: TopicBrowser owns the URL hash. The final project lives outside this repo and is not part of these rules.
Topics 4-6 each contain a small local auth provider so each file stays self-contained.
## Known gaps
ESLint is added on day2. Dependencies use caret ranges; pin exact versions after the first full successful build.
