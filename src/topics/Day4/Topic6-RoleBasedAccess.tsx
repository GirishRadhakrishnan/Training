// DAY 4 · TOPIC 6: Role-based access
//
// Authorization decides what a signed-in user may do. Three layers, each for a reason:
//   RequireRole  a layout route that shows a clear 403 "Not allowed" page for the wrong role
//   can(user, action, leave)  one helper (src/lib/permissions.ts) that decides, so
//                buttons are hidden by the same rule everywhere
//   the SERVER   repeats every rule. Hide in the UI, enforce on the server.
// The red button below calls the API directly as an Employee: hiding it in the UI changed
// nothing for the server, which still answers 403.
// MemoryRouter keeps the demo off the topic hash. The tiny provider only holds a chosen user.

import { useState } from "react";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError, getLeaves, updateLeaveStatus } from "../../api/leaves";
import { login } from "../../api/auth";
import { setToken } from "../../api/http";
import { can } from "../../lib/permissions";
import type { Role, User } from "../../types";

const ACCOUNTS: Record<Role, [string, string]> = { Employee: ["asha@demo.test", "asha123"], Manager: ["rohan@demo.test", "rohan123"] };

function RequireRole({ user, role }: { user: User; role: Role }) {
  if (user.role !== role) {
    return (
      <div className="message error" role="alert">
        <h3>403: not allowed</h3>
        <p>This page is only for a {role}. You are signed in as {user.name} ({user.role}).</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }
  return <Outlet />;
}

function Team({ user }: { user: User }) {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["leaves", "team", user.id],
    queryFn: ({ signal }) => getLeaves({ scope: "team" }, undefined, signal),
  });
  if (isPending) return <p className="muted">Loading team requests…</p>;
  if (error) return <p className="message error">Could not load team requests: {error.message} <button onClick={() => refetch()}>Retry</button></p>;
  if (data.length === 0) return <p>No team requests yet.</p>;
  return (
    <ul>
      {data.map((leave) => (
        <li key={leave.id}>
          {leave.employee}: {leave.type} ({leave.status}){" "}
          {can(user, "approve", leave) && <button>Approve</button>}
        </li>
      ))}
    </ul>
  );
}

export default function RoleBasedAccess() {
  const [user, setUser] = useState<User | null>(null);
  const [apiResult, setApiResult] = useState("");

  async function signInAs(role: Role) {
    const session = await login(...ACCOUNTS[role]);
    setToken(session.token);
    setUser(session.user);
    setApiResult("");
  }

  async function approveDirectly() {
    // No button exists for this in the UI for an Employee, but anyone can send this request
    try {
      await updateLeaveStatus(4, "Approved", { delay: 0 });
      setApiResult("Approved (200)");
    } catch (error) {
      setApiResult(error instanceof ApiError ? `Server answered ${error.status}: ${error.message}` : "Network error");
    }
  }

  return (
    <div>
      <h2>Role-based access</h2>
      <div className="demo">
        <div className="row">
          <button onClick={() => signInAs("Employee")}>Sign in as Asha (Employee)</button>
          <button onClick={() => signInAs("Manager")}>Sign in as Rohan (Manager)</button>
          <button onClick={() => { setToken(null); setUser(null); }}>Sign out</button>
        </div>
        {!user && <p className="muted">Choose a user to start.</p>}
        {user && (
          <MemoryRouter key={user.id}>
            <p>Signed in as <strong>{user.name}</strong> ({user.role})</p>
            <nav className="row">
              <Link to="/">Home</Link>
              {can(user, "viewTeam") && <Link to="/team">Team requests</Link>}
              <Link to="/team">Team requests (link shown to everyone)</Link>
            </nav>
            <Routes>
              <Route path="/" element={<p>Home. Managers see an extra link above.</p>} />
              <Route element={<RequireRole user={user} role="Manager" />}>
                <Route path="/team" element={<Team user={user} />} />
              </Route>
            </Routes>
            <button className="danger" onClick={approveDirectly}>Call the approve API directly</button>
            {apiResult && <p className="message">{apiResult}</p>}
          </MemoryRouter>
        )}
      </div>
      <p className="try">
        Try it: as Asha, open the second Team requests link to see the 403 page, then press the red
        button. Sign in as Rohan and press it again: the same call now works.
      </p>
    </div>
  );
}
