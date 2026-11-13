// DAY 3 · TOPIC 6: Introduction to TanStack Query
//
// In Topic 5 we fixed five problems by hand: loading, errors, caching, freshness, races.
// TanStack Query (formerly React Query) is a library that does all of that for you.
//   - It does NOT fetch data. You still write the fetch function. It decides WHEN to call it,
//     keeps the result in a cache, and gives your component the loading and error flags.
//   - It manages SERVER state: data that lives on a server, not in your component.
// This topic: what it gives you, client vs server state, install and setup, then the two
// hooks you will use most: useQuery (read) and useMutation (write).
// Rule for the rest of the course: server data is never copied into useState.

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LeaveStatus } from "../../types";
import { LEAVE_STATUSES, formatRange } from "../../lib/leave";
import { getLeaves, updateLeaveStatus } from "../../api/leaves";

const INSTALL = `npm install @tanstack/react-query`;

const SETUP = `// src/main.tsx: create ONE client (the cache) and provide it to the whole app
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);`;

const USE_QUERY = `const { data, isPending, isError, error } = useQuery({
  queryKey: ["leaves", { status }],           // cache address: include every variable
  queryFn: ({ signal }) => getLeaves({ status }, undefined, signal),
});`;

const USE_MUTATION = `const queryClient = useQueryClient();
const change = useMutation({
  mutationFn: (id: number) => updateLeaveStatus(id, "Approved"),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ["leaves"] }), // refetch the lists
});
change.mutate(3);   // call it from an event handler`;

function Code({ children }: { children: string }) {
  return (
    <pre>
      <code>{children}</code>
    </pre>
  );
}

function LiveDemo() {
  const [status, setStatus] = useState<LeaveStatus | "All">("All");
  const queryClient = useQueryClient();

  // Read: useQuery
  const { data, isPending, isFetching, isError, error } = useQuery({
    queryKey: ["leaves", { status }],
    queryFn: ({ signal }) => getLeaves(status === "All" ? {} : { status }, undefined, signal),
    staleTime: 10_000, // fresh for 10 s: coming back to a filter inside 10 s does not refetch
  });

  // Write: useMutation. After it settles, every "leaves" query is refetched.
  const toggle = useMutation({
    mutationFn: ({ id, next }: { id: number; next: LeaveStatus }) => updateLeaveStatus(id, next),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["leaves"] }),
  });

  const first = data?.[0];

  return (
    <div className="demo">
      <div className="row">
        <label>
          Status{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option>All</option>
            {LEAVE_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="muted">key: {JSON.stringify(["leaves", { status }])}</span>
      </div>
      <p>
        isPending: <b>{String(isPending)}</b> · isFetching: <b>{String(isFetching)}</b> · isError:{" "}
        <b>{String(isError)}</b>
      </p>
      {isPending && <p className="muted">Loading leave requests…</p>}
      {isError && <p className="message error">Could not load leave requests: {error.message}</p>}
      {data && data.length === 0 && <p className="muted">No {status.toLowerCase()} leave requests.</p>}
      {data && data.length > 0 && (
        <ul>
          {data.map((leave) => (
            <li key={leave.id}>
              {leave.employee}: {leave.type}, {formatRange(leave.startDate, leave.endDate)} ({leave.status})
            </li>
          ))}
        </ul>
      )}
      {first && (
        <button
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ id: first.id, next: first.status === "Approved" ? "Pending" : "Approved" })}
        >
          {toggle.isPending ? "Saving…" : `Toggle ${first.employee}'s request: Approved / Pending`}
        </button>
      )}
      {toggle.isError && <p className="message error">Could not save the change: {toggle.error.message}</p>}
    </div>
  );
}

export default function IntroToTanStackQuery() {
  return (
    <div>
      <h2>Introduction to TanStack Query</h2>

      <h3>1. What it is and what it does</h3>
      <p>
        TanStack Query is a library that manages <b>server state</b> in React. You give it a function that fetches data;
        it calls that function at the right time and looks after the result.
      </p>
      <table>
        <thead>
          <tr>
            <th>Problem from Topic 5</th>
            <th>What TanStack Query does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Loading state</td>
            <td>
              <code>isPending</code> and <code>isFetching</code> flags, always correct
            </td>
          </tr>
          <tr>
            <td>Error handling</td>
            <td>
              <code>error</code>, <code>isError</code> and <code>refetch</code> for Retry; cleared when a request succeeds
            </td>
          </tr>
          <tr>
            <td>Caching and duplicate requests</td>
            <td>One cache keyed by <code>queryKey</code>; components that ask for the same key share one request</td>
          </tr>
          <tr>
            <td>Freshness and sync</td>
            <td>
              <code>staleTime</code>, refetch on window focus and reconnect, <code>invalidateQueries</code> after edits
            </td>
          </tr>
          <tr>
            <td>Race conditions</td>
            <td>The key decides which data you see; old requests are cancelled through the abort signal</td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        Also built in: retries, background refetching, devtools, pagination helpers. Less code in every component,
        and the same behaviour on every screen.
      </p>

      <h3>2. Client state vs server state</h3>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Client state</th>
            <th>Server state</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lives in</td>
            <td>The browser, owned by your app</td>
            <td>A server or database, you only hold a copy</td>
          </tr>
          <tr>
            <td>Examples</td>
            <td>Is the modal open, text in a form field, selected tab, filter choice</td>
            <td>Leave requests, employees, balances</td>
          </tr>
          <tr>
            <td>Access</td>
            <td>Synchronous: always there</td>
            <td>Asynchronous: loading, can fail</td>
          </tr>
          <tr>
            <td>Can go out of date?</td>
            <td>No, you are the only writer</td>
            <td>Yes, anyone can change it</td>
          </tr>
          <tr>
            <td>Tool</td>
            <td>useState, useReducer (Day 4: Zustand)</td>
            <td>TanStack Query</td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        In this course: the status filter below is client state (useState). The list it selects is server state
        (useQuery). Never copy server data into useState.
      </p>

      <h3>3. From install to first use</h3>
      <p>Step 1: install the package (already done in this project).</p>
      <Code>{INSTALL}</Code>
      <p>
        Step 2: create one <code>QueryClient</code> and wrap the app in <code>QueryClientProvider</code> (already done
        in <code>src/main.tsx</code>). The client is the cache. Every component below it can use the hooks.
      </p>
      <Code>{SETUP}</Code>
      <p>Step 3: use the hooks in any component. Try them live:</p>
      <LiveDemo />
      <p className="note">
        Pick Approved, then All, then Approved again within 10 seconds: the second visit is instant, with no request.
        Click the toggle button: the mutation saves, then invalidates the key, and the list refetches by itself.
      </p>

      <h3>4. The common hooks</h3>
      <table>
        <thead>
          <tr>
            <th>Hook</th>
            <th>Use it to</th>
            <th>HTTP</th>
            <th>Gives you</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>useQuery</code>
            </td>
            <td>Read data and cache it</td>
            <td>GET</td>
            <td>data, isPending, isFetching, isError, error, refetch</td>
          </tr>
          <tr>
            <td>
              <code>useMutation</code>
            </td>
            <td>Create, change or delete data</td>
            <td>POST, PATCH, DELETE</td>
            <td>mutate, isPending, isError, error</td>
          </tr>
          <tr>
            <td>
              <code>useQueryClient</code>
            </td>
            <td>Reach the cache, e.g. to invalidate after a mutation</td>
            <td>-</td>
            <td>invalidateQueries, setQueryData</td>
          </tr>
        </tbody>
      </table>
      <h4>useQuery</h4>
      <Code>{USE_QUERY}</Code>
      <p className="note">
        queryKey is the address in the cache. A new key is a new cache entry and a new request. queryFn returns a
        promise and throws on failure.
      </p>
      <h4>useMutation</h4>
      <Code>{USE_MUTATION}</Code>
      <p className="note">
        A query runs by itself when the component shows. A mutation runs only when you call mutate, usually from a
        click or a form submit. The next topics build the loading, error and empty screens and the full create, edit
        and delete flow on top of these two hooks.
      </p>

    </div>
  );
}
