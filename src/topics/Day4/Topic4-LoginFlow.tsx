// DAY 4 · TOPIC 4: Login flow
//
// 1. A controlled form (labels, aria-invalid) validates, then useMutation POSTs /api/login.
// 2. AuthContext holds { user, status, login, logout }. Context is right here: the signed-in
//    user is small and rarely changes. The user itself is server data, so it lives in
//    TanStack Query (["me"]); the context only hands it out.
// 3. On page load a stored token is checked with GET /api/me: status "checking" until it answers.
// 4. logout() forgets the token and clears the Query cache, so the next person sees nothing of the last.
// 5. A global 401 handler (setUnauthorizedHandler) logs out when the server rejects a token.
// This file has its own small provider so it stays self-contained (the project has its own).

import { createContext, useContext, useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DEMO_ACCOUNTS, getMe, login as postLogin } from "../../api/auth";
import { getToken, setToken, setUnauthorizedHandler } from "../../api/http";
import type { LoginResponse, User } from "../../types";

type Status = "checking" | "signedIn" | "signedOut";
type Auth = { user: User | null; status: Status; login: (session: LoginResponse) => void; logout: () => void };
const AuthContext = createContext<Auth | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => getToken() !== null);
  const me = useQuery({ queryKey: ["me"], queryFn: ({ signal }) => getMe(signal), enabled: hasToken });

  const logout = () => {
    setToken(null);
    setHasToken(false);
    queryClient.clear();
  };
  const login = ({ token, user }: LoginResponse) => {
    setToken(token);
    queryClient.setQueryData(["me"], user);
    setHasToken(true);
  };
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  });

  const user = hasToken ? (me.data ?? null) : null;
  const status: Status = !hasToken ? "signedOut" : me.isPending ? "checking" : user ? "signedIn" : "signedOut";
  return <AuthContext value={{ user, status, login, logout }}>{children}</AuthContext>;
}

function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
  return auth;
}

function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const mutation = useMutation({ mutationFn: () => postLogin(form.username.trim(), form.password), onSuccess: login });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = {
      username: form.username.trim() ? undefined : "Enter your username.",
      password: form.password ? undefined : "Enter your password.",
    };
    setErrors(next);
    if (!next.username && !next.password) mutation.mutate();
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" value={form.username} aria-invalid={!!errors.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        {errors.username && <p className="field-error">{errors.username}</p>}
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={form.password} aria-invalid={!!errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>
      {mutation.isError && <p className="message error" role="alert">{mutation.error.message}</p>}
      <button className="primary" disabled={mutation.isPending}>{mutation.isPending ? "Signing in…" : "Sign in"}</button>
      <p className="muted">Demo accounts (fake):{" "}
        {DEMO_ACCOUNTS.map((a) => `${a.username} / ${a.password} (${a.role})`).join(", ")}</p>
    </form>
  );
}

function Panel() {
  const { user, status, logout } = useAuth();
  const queryClient = useQueryClient();
  if (status === "checking") return <p className="muted">Checking your session…</p>;
  if (!user) return <LoginForm />;
  return (
    <div>
      <p className="message success">Signed in as {user.name} ({user.role}).</p>
      <div className="row">
        <button onClick={logout}>Log out</button>
        {/* Demo: a bad token makes /api/me answer 401, and the global handler logs us out */}
        <button onClick={() => { setToken("expired-token"); queryClient.invalidateQueries({ queryKey: ["me"] }); }}>
          Simulate an expired session
        </button>
      </div>
    </div>
  );
}

export default function LoginFlow() {
  return (
    <div>
      <h2>Login flow</h2>
      <div className="demo">
        <AuthProvider>
          <Panel />
        </AuthProvider>
      </div>
      <p className="try">
        Try it: sign in with a wrong password, then a right one. Refresh the page: you stay
        signed in after "Checking your session…". Then press "Simulate an expired session".
      </p>
    </div>
  );
}
