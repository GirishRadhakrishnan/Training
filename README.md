# React leave training

A 4-day (4 x 90 min) React 19 + TypeScript course for developers new to React. One file per topic. It ends with a small Employee Leave Tracker app.

See `PLAN.md` for the schedule, `CLAUDE.md` for project rules and `GIT.md` for the branch workflow.

## Branches

| Branch | Content |
|--------|---------|
| day1 | React fundamentals (8 topics) |
| day2 | day1 + state and hooks (10 topics, 18 in total) |
| day3 | day2 + server state, CRUD, routing (7 topics) |
| day4 | day3 + shared state (8 topics) + final project in `src/project/` |

## Run

```
npm install      # after every branch switch
npm run dev      # start the dev server
npm run build    # type-check and build; must pass on every branch
```

Requires Node 22.22 or newer.

## Day 1 topics

1. React fundamentals
2. JSX
3. Components
4. Typed props
5. Conditional rendering
6. Lists, map, filter and keys
7. Event handling
8. Styling

**Day 1 task:** build a static "My leaves" page from `src/sample/leaves.ts` with status badges, a Cancel button on pending items only, and Pending and History sections.

## Day 2 topics

1. Props vs state
2. useState
3. Controlled forms
4. Lifting state up
5. Rules of hooks
6. useEffect
7. useRef
8. useReducer
9. Custom hooks
10. Class components (awareness)

**Day 2 task:** add debounced search, status and type filters (useReducer), working days per request, and a "No requests match" empty state to the My leaves page.
