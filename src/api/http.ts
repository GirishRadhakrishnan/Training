// Shared fetch plumbing: the token, ApiError and request().
//
// fetch() only rejects on network failure. A 401, 404 or 500 still "succeeds",
// so every call goes through request(), which checks response.ok and throws ApiError.

// An Error that also remembers the HTTP status, so screens can tell 401 from 403 from 404
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Token storage. The training app keeps the token in a module variable (memory) and
// mirrors it to sessionStorage so a page refresh can restore the session.
//   memory          safest from other scripts, lost on refresh
//   sessionStorage  survives refresh, cleared when the tab closes, readable by any script (XSS)
//   localStorage    survives restarts, readable by any script: avoid for tokens
//   httpOnly cookie JavaScript cannot read it. Real apps prefer this.
// Never log tokens or passwords.
const STORAGE_KEY = "leave-training-token";
let token: string | null = null;
try {
  token = sessionStorage.getItem(STORAGE_KEY);
} catch {
  // storage blocked: memory only
}

export function getToken(): string | null {
  return token;
}

export function setToken(value: string | null) {
  token = value;
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Called when the server answers 401 to a request that carried a token (expired or
// invalid session). The AuthProvider registers a function here that logs the user out.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      // The Day 3 demo API answers { error }, the secured API answers { message }
      if (typeof body.message === "string") message = body.message;
      else if (typeof body.error === "string") message = body.error;
    } catch {
      // body was not JSON: keep the generic message
    }
    if (response.status === 401 && token) onUnauthorized?.();
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
