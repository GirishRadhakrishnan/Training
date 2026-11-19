import type { LeaveRequest, LeaveStatus, LeaveType, NewLeave } from "../types";
import { ApiError, getToken, json, request } from "./http";

// Typed helpers for the mock REST API (see server/mockApi.ts).
// request() (src/api/http.ts) checks response.ok, sends the token and throws ApiError
// with the status code, so the UI can tell 401 from 403 from 404.
export { ApiError };

// Which API?  Signed in -> the secured /api/leaves (the server checks who you are).
// Not signed in -> the open Day 3 demo API, so the Day 3 topics work without login.
// The secured API never answers without a token, so this cannot bypass the rules.
const base = () => (getToken() ? "/api/leaves" : "/api/demo/leaves");

// Optional switches the mock server understands (for demos)
export type Simulate = { delay?: number; fail?: boolean; empty?: boolean };

export type LeaveFilters = { status?: LeaveStatus; type?: LeaveType; scope?: "team" };

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

export function getLeaves(
  filters: LeaveFilters = {},
  sim?: Simulate,
  signal?: AbortSignal,
): Promise<LeaveRequest[]> {
  return request(withParams(base(), { ...filters, ...simulateParams(sim) }), { signal });
}

export function getLeave(id: number, sim?: Simulate, signal?: AbortSignal): Promise<LeaveRequest> {
  return request(withParams(`${base()}/${id}`, simulateParams(sim)), { signal });
}

// When signed in, the server sets "employee" itself and ignores any name sent here
export function createLeave(
  leave: Omit<NewLeave, "employee"> & { employee?: string },
  sim?: Simulate,
): Promise<LeaveRequest> {
  return request(withParams(base(), simulateParams(sim)), json("POST", leave));
}

// PATCH sends only the fields that change (the secured API accepts only status)
export function updateLeave(
  id: number,
  changes: Partial<NewLeave & { status: LeaveStatus }>,
  sim?: Simulate,
): Promise<LeaveRequest> {
  return request(withParams(`${base()}/${id}`, simulateParams(sim)), json("PATCH", changes));
}

export function updateLeaveStatus(
  id: number,
  status: LeaveStatus,
  sim?: Simulate,
): Promise<LeaveRequest> {
  return updateLeave(id, { status }, sim);
}

export function deleteLeave(id: number, sim?: Simulate): Promise<void> {
  return request(withParams(`${base()}/${id}`, simulateParams(sim)), { method: "DELETE" });
}
