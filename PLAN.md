# PLAN.md
## Schedule (4 days x 90 min; ~70 min teaching, ~20 min practice; run back-to-back)
Day 1 React fundamentals (day1, 8 topics) | Day 2 State and hooks (day2, 10) | Day 3 Server state, CRUD, routing (day3, 7) | Day 4 Shared state + final project (day4, 8 + project)
## Day 1 (90 min)
| # | File | Min | Demonstrates |
|---|------|-----|--------------|
| 1 | Topic1-ReactFundamentals.tsx | 8 | UI = f(data), component tree, one component with different data |
| 2 | Topic2-JSX.tsx | 8 | {} expressions, camelCase attributes, style object, closing tags, fragments |
| 3 | Topic3-Components.tsx | 10 | function components, composition, why props are needed |
| 4 | Topic4-TypedProps.tsx | 12 | typed props, optional/default values, children, read-only props |
| 5 | Topic5-ConditionalRendering.tsx | 8 | ternary, &&, early return, the `0 &&` pitfall |
| 6 | Topic6-ListsMapFilterKeys.tsx | 14 | map, filter, key, empty list, live key bug |
| 7 | Topic7-EventHandling.tsx | 8 | onClick/onChange/onSubmit, arrow wrapper, preventDefault, the fn() mistake |
| 8 | Topic8-Styling.tsx + .module.css | 6 | CSS Modules, global CSS, conditional classes, inline style for runtime values |
Lab and task briefing: 16 min.
Day 1 task: static "My leaves" page from src/sample/leaves.ts with status badges, a Cancel button on pending items only, Pending and History sections.
## Day 2 (90 min)
| # | File | Min | Demonstrates |
|---|------|-----|--------------|
| - | Recap of Day 1 submissions | 5 | review trainee "My leaves" pages |
| 1 | Topic1-PropsVsState.tsx | 5 | read-only props vs own state, two independent cards |
| 2 | Topic2-UseState.tsx | 12 | snapshot problem, updater form, object spread, array add/remove, React Compiler note |
| 3 | Topic3-ControlledForms.tsx | 12 | one change handler, validation on submit, aria-invalid, derived working days |
| 4 | Topic4-LiftingStateUp.tsx | 8 | parent owns filter, children read it, derived visible list |
| 5 | Topic5-RulesOfHooks.tsx | 4 | hooks before early return, broken examples in comments, runtime error |
| 6 | Topic6-UseEffect.tsx | 14 | document title, timer with cleanup, no effect needed, StrictMode double run |
| 7 | Topic7-UseRef.tsx | 6 | DOM ref and focus, ref as a prop (React 19), timer id in a ref |
| 8 | Topic8-UseReducer.tsx | 7 | typed actions, reducer, filters over sample leaves, empty state |
| 9 | Topic9-CustomHooks.tsx | 8 | useDebounce, useLocalStorage |
| 10 | Topic10-ClassComponents.tsx | 4 | read a class component, mapping to hooks |
| - | Task briefing | 5 | |
Total: 90 min. Helpers used by the topics: src/lib/leave.ts (workingDays, daysByStatus, datesOverlap, formatRange, ALLOWANCE).
Day 2 task: add debounced search, status and type filters (useReducer), working days per request, and a "No requests match" empty state to the My leaves page.
## Later days (expand when built)
Day 3: WhyTanStackQuery, UseQuery, LoadingErrorEmpty, CreateUpdateDelete, OptimisticUpdates, RouterBasics, NestedRoutesAndParams. Task: "My leaves" from the API with loading/error/empty states, Cancel via useMutation, /leaves/:id.
Day 4: StateMap, PropDrilling, ContextAPI, Zustand, StoreAndServerState, ReduxToolkitComparison, ErrorBoundaries, ProjectTour. Task: manager-only Flagged list in Zustand (ids only) + 3 lines on where each state lives.
## State decision
Local UI: useState/useReducer (Day 2) | Server data: TanStack Query (Day 3) | URL: Router (Day 3) | Shared client: Zustand, Context for small values (Day 4) | Existing/large Redux apps: Redux Toolkit (comparison only).
## Final project (day4)
Employee Leave Tracker in src/project/. "View as" Employee (Asha Rao) / Manager, no login. Pages: My leaves, Apply, Detail, Team requests (manager), Flagged (manager), 404.
Annual 18 days, Sick 10, Casual 6, Unpaid unlimited; weekends excluded. Optimistic approve/reject/cancel with rollback.
## Checklist
[x] day1 built and committed [x] day2 built and committed [ ] day3 [ ] day4 [ ] ESLint on day2 [ ] solution branches [ ] versions pinned, course tag
