// DAY 4 · TOPIC 3: Authentication vs authorization
//
// Authentication = WHO are you?  Failing it is a 401 ("not signed in").
// Authorization  = WHAT may you do?  Failing it is a 403 ("signed in, but not allowed").
// Rule: the client only improves the experience (hide buttons, redirect). The SERVER
// enforces security, because anyone can call the API without our React code.
//
// Where can a token live in the browser?
//   memory           gone on refresh, hard for other scripts to reach
//   sessionStorage   survives refresh, cleared with the tab, readable by any script (XSS)
//   localStorage     survives restarts, readable by any script: avoid for tokens
//   httpOnly cookie  JavaScript cannot read it at all: what real apps prefer
// This training app uses memory plus sessionStorage, only so a refresh keeps the demo
// session. Never log tokens or passwords. This demo keeps its tokens in state and never shows them.

import { useState } from "react";
import { login } from "../../api/auth";

type Result = { call: string; status: number; text: string };

// On-screen checklist: the order to build auth in a project. Each step names its file.
const STEPS = [
  {
    file: "server/mockApi.ts",
    title: "Server: verify, issue a token, enforce",
    todo: "POST /api/login checks the password and returns { token, user } or 401. Every protected endpoint checks the token (401) and then the role (403). This is the only real security.",
  },
  {
    file: "src/types.ts",
    title: "Types: User, Role, LoginResponse",
    todo: "User has id, name and role, and never a password. Role is Employee or Manager. LoginResponse is { token, user }.",
  },
  {
    file: "src/api/http.ts",
    title: "One place for the token",
    todo: "Keep getToken and setToken here only (memory plus sessionStorage). request() adds Authorization: Bearer <token>, throws ApiError(status), and calls the unauthorized handler on a 401.",
  },
  {
    file: "src/api/auth.ts",
    title: "Two API calls",
    todo: "login(username, password) posts to /api/login. getMe() asks /api/me who the stored token belongs to, to restore a session after refresh.",
  },
  {
    file: "Employee leave management Basic/src/auth/AuthContext.tsx",
    title: "Context: who is signed in",
    todo: "Keep only user, status (checking, signedIn, signedOut), login and logout. The user comes from a ['me'] query. logout clears the token and the query cache. Register logout as the 401 handler. Never put the token or leave data in context.",
  },
  {
    file: "Employee leave management Basic/src/App.tsx",
    title: "Mount the provider",
    todo: "Wrap the routes in AuthProvider, inside QueryClientProvider (it uses useQuery) and inside the router.",
  },
  {
    file: "Employee leave management Basic/src/pages/Login.tsx",
    title: "Login page",
    todo: "Controlled inputs with labels and aria-invalid, a password field, a mutation that calls login(session) on success, then navigate back to location.state.from. Show a specific error for a wrong password.",
  },
  {
    file: "Employee leave management Basic/src/auth/guards.tsx",
    title: "Guards: RequireAuth and RequireRole",
    todo: "RequireAuth waits while status is checking, redirects to /login with state.from, else renders <Outlet />. RequireRole shows a Not allowed page when the role is wrong. Use it only inside RequireAuth.",
  },
  {
    file: "Employee leave management Basic/src/routes.tsx",
    title: "Wire guards into the route map",
    todo: "Keep /login public. Nest the app inside RequireAuth, and manager-only pages inside RequireRole as well. Read the map from the outside in.",
  },
  {
    file: "Employee leave management Basic/src/components/Layout.tsx",
    title: "Use the user in the UI",
    todo: "Show the user's name and a Sign out button. Show manager-only links only to managers. This is courtesy: the guards and the server still do the blocking.",
  },
];

// Top-of-page diagram: the layers of the auth setup, from the server down to the UI.
const LAYERS = [
  { name: "Server / backend", file: "", text: "Login, issue token, validate token, enforce permissions" },
  { name: "HTTP layer", file: "http.ts", text: "Store token and attach Authorization header" },
  { name: "AuthContext", file: "", text: "Manage user, authentication status, login and logout" },
  { name: "React Router guards", file: "", text: "RequireAuth and RequireRole" },
  { name: "UI components", file: "", text: "Show user information, permissions and logout" },
];

const ASHA = ["asha@demo.test", "asha123"] as const; // fake demo accounts
const ROHAN = ["rohan@demo.test", "rohan123"] as const;

export default function AuthenticationVsAuthorization() {
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Result[]>([]);

  // Call the API with an explicit token (or none). Plain fetch: we want to see raw statuses.
  async function call(label: string, path: string, who?: readonly [string, string]) {
    let token: string | undefined;
    if (who) {
      token = tokens[who[0]];
      if (!token) {
        token = (await login(who[0], who[1])).token;
        setTokens((old) => ({ ...old, [who[0]]: token! }));
      }
    }
    const response = await fetch(`${path}${path.includes("?") ? "&" : "?"}delay=0`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const body = await response.json().catch(() => null);
    const text = Array.isArray(body) ? `${body.length} requests returned` : (body?.message ?? "OK");
    setResults((old) => [{ call: label, status: response.status, text }, ...old].slice(0, 6));
  }

  // Same idea with an API KEY: a fixed secret that identifies an application, sent in a header
  async function callWithKey(label: string, key?: string) {
    const response = await fetch("/api/reports?delay=0", { headers: key ? { "x-api-key": key } : {} });
    const body = await response.json().catch(() => null);
    const text = response.ok ? `${body.message}: ${body.pendingRequests} pending requests` : (body?.message ?? "Error");
    setResults((old) => [{ call: label, status: response.status, text }, ...old].slice(0, 6));
  }

  return (
    <div>
      <h2>Authentication vs authorization</h2>
      <section className="demo" aria-labelledby="arch-title">
        <h3 id="arch-title" style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>Authentication architecture</h3>
        <ol className="arch">
          {LAYERS.map((layer) => (
            <li key={layer.name}>
              <strong>
                {layer.name}
                {layer.file && (
                  <>
                    {" – "}
                    <code>{layer.file}</code>
                  </>
                )}
              </strong>
              <span>{layer.text}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="cols-2">
        <div className="card">
          <h3>Authentication: 401</h3>
          <p>Who are you? No valid token means the server does not know you.</p>
        </div>
        <div className="card">
          <h3>Authorization: 403</h3>
          <p>What may you do? The server knows you, but your role does not allow this.</p>
        </div>
      </div>
      <div className="demo">
        <div className="row">
          <button onClick={() => call("No token: my leaves", "/api/leaves")}>No token: my leaves</button>
          <button onClick={() => call("Asha (Employee): my leaves", "/api/leaves", ASHA)}>Asha: my leaves</button>
          <button onClick={() => call("Asha (Employee): team requests", "/api/leaves?scope=team", ASHA)}>
            Asha: team requests
          </button>
          <button onClick={() => call("Rohan (Manager): team requests", "/api/leaves?scope=team", ROHAN)}>
            Rohan: team requests
          </button>
        </div>
        <p className="muted">
          API key example (header <code>x-api-key</code>). A key identifies an application, not a person. This one is a
          fake demo key: a real key must never be placed in React code, because anyone can read it.
        </p>
        <div className="row">
          <button onClick={() => callWithKey("API key: none")}>Reports: no key</button>
          <button onClick={() => callWithKey("API key: wrong", "wrong-key")}>Reports: wrong key</button>
          <button onClick={() => callWithKey("API key: valid", "demo-key-123")}>Reports: valid key</button>
        </div>
        {results.length === 0 &&<p className="muted">Press a button to call the API.</p>}
        {results.map((r, i) => (
          <p key={i} className={r.status < 400 ? "message success" : "message error"}>
            {r.call}: <strong>{r.status}</strong> {r.text}
          </p>
        ))}
      </div>
      <h3>Adding authentication and authorization to a project</h3>
      <p className="muted">Build in this order. The server comes first, because the client only improves the experience.</p>
      <ol>
        {STEPS.map((s) => (
          <li key={s.file}>
            <strong>{s.title}</strong> <code>{s.file}</code>
            <br />
            <span className="muted">{s.todo}</span>
          </li>
        ))}
      </ol>
      <p className="try">
        Try it: open the browser Network tab, press "Asha: team requests" and read the response
        body. Then explain why hiding a "Team requests" link would not be enough on its own.
      </p>
    </div>
  );
}
