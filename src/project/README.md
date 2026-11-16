# Employee Leave Tracker (sample project)

A small, complete React 19 + TypeScript app that uses everything from Days 1 to 4: components and props, state and forms, TanStack Query, routing, login and roles.

## Run it

```
npm install
npm run dev
```

Open <http://localhost:5173/project>. (The topics are at the root URL.) The mock API runs inside the Vite dev server (`server/mockApi.ts`) and resets when you restart `npm run dev`.

## Demo users (fake, for training only)

| Name | Role | Username | Password |
|------|------|----------|----------|
| Asha Rao | Employee | asha@demo.test | asha123 |
| Rohan Mehta | Manager | rohan@demo.test | rohan123 |

## Route map

Paths are relative to `/project`.

| Path | Who can open it | What it shows |
|------|-----------------|---------------|
| `/login` | Everyone | Sign-in form with the demo accounts. Sends you back to the page you wanted. |
| `/` | Signed-in users | Redirects to `/leaves`. |
| `/leaves` | Signed-in users | My leaves: balances per leave type, status filter in the URL (`?status=Pending`), cancel buttons. |
| `/leaves/new` | Signed-in users | Apply for leave: working-day preview, server validation messages. |
| `/leaves/:id` | Signed-in users (Employees: own requests only) | One request. Cancel with an optimistic update and rollback. |
| `/team` | Managers only | Team requests: approve and reject with optimistic updates. Employees see the 403 page. |
| anything else | Signed-in users | 404 page. |

Not signed in? Every page except `/login` redirects to `/login`.

## Folder map

```
src/project/
  ProjectApp.tsx      providers: QueryClient, BrowserRouter (basename /project), AuthProvider
  routes.tsx          the whole route map
  auth/               AuthContext (user, status, login, logout) and guards (RequireAuth, RequireRole)
  api/leaves.ts       TanStack Query hooks, including the optimistic useChangeStatus
  pages/              one file per screen
  components/         Layout, LeaveCard, TextField, Loading / LoadError / Empty
  project.css         plain CSS, class names start with pj-
```

Shared code lives outside this folder: `src/api/` (fetch helpers, token, `ApiError`), `src/lib/leave.ts` (working days, allowances), `src/lib/permissions.ts` (`can()`), and the server in `server/mockApi.ts`.

## Trainee exercises

Work on your own branch. Start with the easiest.

1. **Reason is required (easy).** The Apply form already says "Add a short reason for your manager." Make the message more specific: a reason must be at least 10 characters. Show a different message for empty and for too short.
2. **Team calendar (medium).** On the Team requests page, add a list "Who is away this month" that shows only Approved leaves grouped by employee. Calculate it while rendering; do not store it.
3. **Manager comment on reject (medium).** When a Manager presses Reject, ask for a short comment and show it on the request's detail page. Decide what the API needs to change and where the comment lives.
4. **Withdraw all pending (harder).** On My leaves, add a "Withdraw all pending" button that cancels every pending request. Think about one optimistic update versus many, and what to roll back if one of them fails.
5. **403 vs 404 test list (hardest).** Write a checklist of at least eight requests (who, which URL, which method) and the status code you expect for each: 401, 403, 404, 409. Run them with the browser Network tab or `fetch` and note every place where reality differs from your list. Explain why the server answers 404, not 403, when an Employee opens someone else's request.
