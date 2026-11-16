import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { can } from "../../lib/permissions";
import { simulation } from "../api/leaves";

// Shared frame for every signed-in page. <Outlet /> is where the current page appears.
export default function Layout() {
  const { user, logout } = useAuth();
  const [failMutations, setFailMutations] = useState(simulation.failMutations);

  // NavLink gives "active" for the current page
  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "pj-link active" : "pj-link");

  return (
    <div className="pj-app">
      <header className="pj-header">
        <strong>Leave tracker</strong>
        <nav className="row" aria-label="Main">
          <NavLink to="/leaves" end className={linkClass}>My leaves</NavLink>
          <NavLink to="/leaves/new" className={linkClass}>Apply for leave</NavLink>
          {/* Hidden for Employees. The server would answer 403 anyway. */}
          {can(user, "viewTeam") && <NavLink to="/team" className={linkClass}>Team requests</NavLink>}
        </nav>
        <div className="row pj-user">
          <span>{user?.name} <span className="badge">{user?.role}</span></span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <main className="pj-main">
        <Outlet />
      </main>
      <footer className="pj-footer">
        <label>
          <input
            type="checkbox"
            checked={failMutations}
            onChange={(e) => {
              simulation.failMutations = e.target.checked;
              setFailMutations(e.target.checked);
            }}
          />{" "}
          Demo: make cancel, approve and reject fail (to see the rollback)
        </label>
      </footer>
    </div>
  );
}
