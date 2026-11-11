import type { LeaveRequest, LeaveStatus, LeaveType, NewLeave } from "../types";

// Typed helpers for the mock REST API (see vite.config.ts).
// fetch() only rejects on network failure. A 404 or 500 still "succeeds",
// so every call goes through request(), which checks response.ok and throws.

// Optional switches the mock server understands (for demos)
export type Simulate = { delay?: number; fail?: boolean; empty?: boolean };

export type LeaveFilters = { status?: LeaveStatus; type?: LeaveType };

function withParams(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const text = search.toString();
  return text ? `${path}?${text}` : path;
}

function simulateParams(sim: Simulate = {}) {
  return {
    delay: sim.delay === undefined ? undefined : String(sim.delay),
    fail: sim.fail ? "1" : undefined,
    empty: sim.empty ? "1" : undefined,
  };
}

// An Error that also remembers the HTTP status, so screens can tell a 404 from a 500
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    // The mock API answers errors as { "error": "message" }
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (typeof body.error === "string") message = body.error;
    } catch {
      // body was not JSON: keep the generic message
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export function getLeaves(
  filters: LeaveFilters = {},
  sim?: Simulate,
  signal?: AbortSignal,
): Promise<LeaveRequest[]> {
  const url = withParams("/api/leaves", { ...filters, ...simulateParams(sim) });
  return request(url, { signal });
}

export function getLeave(id: number, sim?: Simulate, signal?: AbortSignal): Promise<LeaveRequest> {
  return request(withParams(`/api/leaves/${id}`, simulateParams(sim)), { signal });
}

export function createLeave(leave: NewLeave, sim?: Simulate): Promise<LeaveRequest> {
  return request(withParams("/api/leaves", simulateParams(sim)), json("POST", leave));
}

// PATCH sends only the fields that change
export function updateLeave(
  id: number,
  changes: Partial<NewLeave & { status: LeaveStatus }>,
  sim?: Simulate,
): Promise<LeaveRequest> {
  return request(withParams(`/api/leaves/${id}`, simulateParams(sim)), json("PATCH", changes));
}

export function updateLeaveStatus(
  id: number,
  status: LeaveStatus,
  sim?: Simulate,
): Promise<LeaveRequest> {
  return updateLeave(id, { status }, sim);
}

export function deleteLeave(id: number, sim?: Simulate): Promise<void> {
  return request(withParams(`/api/leaves/${id}`, simulateParams(sim)), { method: "DELETE" });
}
