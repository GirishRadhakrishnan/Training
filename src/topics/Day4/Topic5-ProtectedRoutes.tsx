// DAY 4 · TOPIC 5: Protected routes
//
// RequireAuth is a LAYOUT ROUTE: it has no path, wraps the pages that need a login and
// renders <Outlet /> when the user may pass.
//   status "checking"  -> show a loading state (we do not know yet, do not flash the login page)
//   no user            -> <Navigate to="/login" replace state={{ from: location }} />
//                         "replace" keeps the protected URL out of the Back history,
//                         "state" remembers where the user wanted to go
//   signed in          -> <Outlet />
// After login, the Login page reads location.state.from and navigates back there.
// This is a convenience for users. It does NOT protect data: the server does (Topic 3).
// MemoryRouter keeps this demo's URL away from the topic hash. The provider is a small
// copy of Topic 4's, so this file is self-contained.

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { Link, MemoryRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login as postLogin } from "../../api/auth";
import { getLeaves } from "../../api/leaves";
import { getToken, setToken } from "../../api/http";
import type { User } from "../../types";

type Auth = { user: User | null; status: "checking" | "signedIn" | "signedOut"; signIn: (u: string, p: string) => Promise<void>; logout: () => void };
const AuthContext = createContext<Auth | null>(null);
const useAuth = () => useContext(AuthContext)!;

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => getToken() !== null);
  const me = useQuery({ queryKey: ["me"], queryFn: ({ signal }) => getMe(signal), enabled: hasToken });
  const signIn = async (username: string, password: string) => {
    const { token, user } = await postLogin(username, password);
    setToken(token);
    queryClient.setQueryData(["me"], user);
    setHasToken(true);
  };
  const logout = () => {
    setToken(null);
    setHasToken(false);
    queryClient.clear();
  };
  const user = hasToken ? (me.data ?? null) : null;
  const status = !hasToken ? "signedOut" : me.isPending ? "checking" : user ? "signedIn" : "signedOut";
  return <AuthContext value={{ user, status, signIn, logout }}>{children}</AuthContext>;
}

function RequireAuth() {
  const { user, status } = useAuth();
  const location = useLocation();
  if (status === "checking") return <p className="muted">Checking your session…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/leaves";
  const mutation = useMutation({
    mutationFn: () => signIn("asha@demo.test", "asha123"), // fake demo account
    onSuccess: () => navigate(from, { replace: true }), // back to where the user wanted to go
  });
  return (
    <div className="card">
      <h3>Sign in</h3>
      <p className="muted">You were sent here from {from}.</p>
      <button className="primary" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        Sign in as Asha (demo)
      </button>
      {mutation.isError && <p className="message error">{mutation.error.message}</p>}
    </div>
  );
}

function Leaves() {
  const { user, logout } = useAuth();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["leaves"], queryFn: ({ signal }) => getLeaves({}, undefined, signal) });
  return (
    <div className="card">
      <h3>My leaves (protected)</h3>
      <p>Signed in as {user?.name}.</p>
      {isPending && <p className="muted">Loading your leave requests…</p>}
      {error && <p className="message error">Could not load: {error.message} <button onClick={() => refetch()}>Retry</button></p>}
      {data && <p>{data.length === 0 ? "You have no leave requests yet." : `${data.length} leave requests.`}</p>}
      <button onClick={logout}>Log out</button>
    </div>
  );
}

function Home() {
  return <p>Public page. <Link to="/leaves">Open My leaves</Link> (needs login).</p>;
}

export default function ProtectedRoutes() {
  return (
    <div>
      <h2>Protected routes</h2>
      <div className="demo">
        <AuthProvider>
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route element={<RequireAuth />}>
                <Route path="/leaves" element={<Leaves />} />
              </Route>
              <Route path="*" element={<p className="message error">Page not found.</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </div>
      <p className="try">
        Try it: log out, then open My leaves from the public page: you land on Sign in, and after
        signing in you return to My leaves. Add a second protected page to the same RequireAuth.
      </p>
    </div>
  );
}
