import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe } from "../../api/auth";
import { getToken, setToken, setUnauthorizedHandler } from "../../api/http";
import type { LoginResponse, User } from "../../types";

// Context is the right tool here: ONE small value that changes rarely (sign in, sign out).
// Everything else (leaves, balances) stays in TanStack Query, never in Context.
//
// "checking"  a token was found and we are asking /api/me whether it is still valid
// "signedIn"  the server confirmed who we are
// "signedOut" no token, or the server rejected it
export type AuthStatus = "checking" | "signedIn" | "signedOut";

type Auth = {
  user: User | null;
  status: AuthStatus;
  login: (session: LoginResponse) => void;
  logout: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // Is a token stored? (the token itself lives in src/api/http.ts, not in React state)
  const [hasToken, setHasToken] = useState(() => getToken() !== null);

  // The user is server data, so it is a query. After a refresh this restores the session.
  const me = useQuery({ queryKey: ["me"], queryFn: ({ signal }) => getMe(signal), enabled: hasToken });

  const login = ({ token, user }: LoginResponse) => {
    setToken(token);
    queryClient.setQueryData(["me"], user);
    setHasToken(true);
  };

  const logout = () => {
    setToken(null);
    setHasToken(false);
    queryClient.clear(); // forget every cached leave: the next person must not see them
  };

  // Global 401 handler: whenever the server rejects our token, sign out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  });

  const user = hasToken ? (me.data ?? null) : null;
  const status: AuthStatus = !hasToken ? "signedOut" : me.isPending ? "checking" : user ? "signedIn" : "signedOut";

  return <AuthContext value={{ user, status, login, logout }}>{children}</AuthContext>;
}

export function useAuth(): Auth {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
  return auth;
}
