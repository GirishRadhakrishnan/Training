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

  return (
    <div>
      <h2>Authentication vs authorization</h2>
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
        {results.length === 0 && <p className="muted">Press a button to call the API.</p>}
        {results.map((r, i) => (
          <p key={i} className={r.status < 400 ? "message success" : "message error"}>
            {r.call}: <strong>{r.status}</strong> {r.text}
          </p>
        ))}
      </div>
      <p className="try">
        Try it: open the browser Network tab, press "Asha: team requests" and read the response
        body. Then explain why hiding a "Team requests" link would not be enough on its own.
      </p>
    </div>
  );
}
