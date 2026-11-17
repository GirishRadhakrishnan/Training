// DAY 4 · TOPIC 7: Project tour
//
// A guided map of the Employee leave management Basic project. It is no longer part of this
// training repo: it lives in its own folder next to it (C:\Users\241347\code\React\Employee Leave
// management Basic). Read it before you open the code: you will see the same ideas from Days 1 to 4
// in one small app. Run it with npm install and npm run dev, open http://localhost:5173, sign in with
// a demo account, then read the files in this order: routes.tsx, auth/, api/, queries/leaves.ts,
// pages/, components/. The project's README.md has the route map and five exercises.

const FOLDERS: [string, string][] = [
  ["main.tsx", "starts React and renders App"],
  ["App.tsx", "QueryClientProvider, BrowserRouter and AuthProvider"],
  ["routes.tsx", "the whole route map: public /login, RequireAuth, Layout, RequireRole"],
  ["auth/AuthContext.tsx", "signed-in user, status, login, logout, session restore, global 401 handler"],
  ["auth/guards.tsx", "RequireAuth and RequireRole layout routes (UX only)"],
  ["api/", "fetch helpers only: http.ts (token, ApiError, request), auth.ts, leaves.ts"],
  ["queries/leaves.ts", "TanStack Query hooks: useMyLeaves, useLeave, useChangeStatus (optimistic)"],
  ["pages/", "Login, MyLeaves (the dashboard), LeaveDetail, TeamRequests, NotAllowed, NotFound"],
  ["components/", "BalanceCard, ApplyForm, TrackerCard, HistoryCard, Layout, LeaveCard, TextField, Status (Loading / LoadError / Empty)"],
  ["styles.css", "plain CSS: the global classes first, then the classes this app uses"],
];

const STATE: [string, string, string][] = [
  ["Local UI (form fields, open/closed)", "useState / useReducer", "components/ApplyForm.tsx"],
  ["Server data (leaves)", "TanStack Query", "queries/leaves.ts, never copied into state"],
  ["Which page, which filter", "the URL, via the router", "/leaves/3, ?status=Pending"],
  ["Who is signed in", "Context", "auth/AuthContext.tsx"],
];

export default function ProjectTour() {
  return (
    <div>
      <h2>Project tour</h2>
      <p>
        The project runs on its own: open its folder, run <code>npm install</code> and{" "}
        <code>npm run dev</code>, then open <code>http://localhost:5173</code> in a new tab. Demo
        accounts: asha@demo.test / asha123 (Employee) and rohan@demo.test / rohan123 (Manager). These are fake.
      </p>

      <h3>Where things live (the project's src/)</h3>
      <table>
        <tbody>
          {FOLDERS.map(([name, what]) => (
            <tr key={name}>
              <td><strong>{name}</strong></td>
              <td>{what}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Where each kind of state lives</h3>
      <table>
        <thead>
          <tr><th>Kind of state</th><th>Tool</th><th>Example</th></tr>
        </thead>
        <tbody>
          {STATE.map(([kind, tool, example]) => (
            <tr key={kind}><td>{kind}</td><td>{tool}</td><td>{example}</td></tr>
          ))}
        </tbody>
      </table>

      <h3>How routes, API and guards fit together</h3>
      <ol>
        <li>The URL picks a route in routes.tsx.</li>
        <li>RequireAuth checks the session (Context); no user means redirect to /login and come back.</li>
        <li>RequireRole checks the role; the wrong role sees the 403 page.</li>
        <li>The page asks a TanStack Query hook for data; the API helper sends the token.</li>
        <li>The server decides again: 401 (not signed in), 403 (not allowed), 404 (not found).
          Guards are only for a better experience.</li>
      </ol>

      <p className="try">
        Try it: in the project, sign in as Asha and type /team in the address bar. Which part stops you:
        the guard, the server, or both? Then find where each happens in the code.
      </p>
    </div>
  );
}
