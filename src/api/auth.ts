import type { LoginResponse, User } from "../types";
import { json, request } from "./http";

// POST /api/login. A wrong password is a 401 ApiError with a specific message.
export function login(username: string, password: string): Promise<LoginResponse> {
  return request("/api/login", json("POST", { username, password }));
}

// GET /api/me: who does the server think I am? Used to restore a session after refresh.
export function getMe(signal?: AbortSignal): Promise<User> {
  return request("/api/me", { signal });
}

// Fake demo accounts (also in server/mockApi.ts). Shown on login screens as a hint.
export const DEMO_ACCOUNTS = [
  { name: "Asha Rao", role: "Employee", username: "asha@demo.test", password: "asha123" },
  { name: "Rohan Mehta", role: "Manager", username: "rohan@demo.test", password: "rohan123" },
];
