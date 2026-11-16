import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { DEMO_ACCOUNTS, login as postLogin } from "../../api/auth";
import { useAuth } from "../auth/AuthContext";
import TextField from "../components/TextField";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  // RequireAuth stored the page the user wanted in location.state.from
  const from = (useLocation().state as { from?: { pathname: string; search: string } } | null)?.from;
  const target = from ? from.pathname + from.search : "/leaves";

  const usernameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const mutation = useMutation({
    mutationFn: () => postLogin(form.username.trim(), form.password),
    onSuccess: (session) => {
      login(session);
      navigate(target, { replace: true }); // back to where the user wanted to go
    },
    onError: () => usernameRef.current?.focus(),
  });

  if (user) return <Navigate to={target} replace />; // already signed in

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
    <div className="pj-login card">
      <h1>Sign in</h1>
      {from && <p className="message">Please sign in to open {from.pathname}.</p>}
      <form className="form" onSubmit={submit} noValidate>
        <TextField id="username" label="Username" ref={usernameRef} autoComplete="username" value={form.username}
          error={errors.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <TextField id="password" label="Password" type="password" autoComplete="current-password" value={form.password}
          error={errors.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mutation.isError && <p className="message error" role="alert">{mutation.error.message}</p>}
        <button className="primary" disabled={mutation.isPending}>{mutation.isPending ? "Signing in…" : "Sign in"}</button>
      </form>
      <h2>Demo accounts (fake)</h2>
      <ul className="muted">
        {DEMO_ACCOUNTS.map((a) => (
          <li key={a.username}>{a.role}: {a.username} / {a.password}</li>
        ))}
      </ul>
    </div>
  );
}
