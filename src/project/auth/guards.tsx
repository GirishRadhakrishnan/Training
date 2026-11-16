import { Navigate, Outlet, useLocation } from "react-router";
import type { Role } from "../../types";
import { useAuth } from "./AuthContext";
import { Loading } from "../components/Status";
import NotAllowed from "../pages/NotAllowed";

// Guards are LAYOUT ROUTES: no path, they wrap other routes and render <Outlet /> to let
// the user through. They improve the experience only. The server enforces security.

export function RequireAuth() {
  const { user, status } = useAuth();
  const location = useLocation();

  // Do not redirect while we are still asking the server about a stored token
  if (status === "checking") return <Loading what="your session" />;
  // replace: the protected URL does not stay in history. state.from: where to return to.
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Must be used inside RequireAuth, so a user always exists here
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();
  if (user?.role !== role) return <NotAllowed needed={role} />; // a 403 page, URL stays the same
  return <Outlet />;
}
