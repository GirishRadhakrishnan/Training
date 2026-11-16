import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { can } from "../../lib/permissions";
import { simulation } from "../api/leaves";

// "Asha Rao" -> "AR"
const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join("");

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
          <NavLink to="/leaves" className={linkClass}>My leaves</NavLink>
          {/* Hidden for Employees. The server would answer 403 anyway. */}
          {can(user, "viewTeam") && <NavLink to="/team" className={linkClass}>Team requests</NavLink>}
        </nav>
        <div className="pj-user">
          <div className="pj-user-text">
            <span className="pj-user-name">{user?.name}</span>
            <span className="pj-user-role">{user?.role}</span>
          </div>
          {/* Avatar: the initials of the name, decorative (the name is already next to it) */}
          <span className="pj-avatar" aria-hidden="true">{initials(user?.name ?? "")}</span>
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
