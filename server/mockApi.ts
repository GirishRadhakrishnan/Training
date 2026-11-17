import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { sampleLeaves } from "../src/sample/leaves";
import { ALLOWANCE, datesOverlap, workingDays } from "../src/lib/leave";
import type { LeaveRequest, LeaveType, User } from "../src/types";

// Mock REST API. It runs inside the Vite dev server, in memory, and resets on restart.
// It is NOT part of the React app. Two APIs share one plugin:
//
//   /api/demo/leaves  Day 3: open CRUD, no login. Used by the Day 3 topics.
//   /api/login        POST {username, password} -> 200 {token, user} or 401 {message}
//   /api/me           GET with "Authorization: Bearer <token>" -> the user, or 401
//   /api/leaves       Day 4: secured. The SERVER enforces the rules (see secureLeaves).
//   /api/reports      GET with an "x-api-key" header -> a count, 401 (no key) or 403 (wrong key)
//
// Simulate real conditions on any request: ?delay=2000 (default 600 ms), ?fail=1 (500),
// ?empty=1 (GET list returns []).

// ---- FAKE DEMO DATA. These are not real people or credentials. ----
type DemoUser = User & { username: string; password: string };
const demoUsers: DemoUser[] = [
  { id: 1, name: "Asha Rao", role: "Employee", username: "asha@demo.test", password: "asha123" },
  { id: 2, name: "Rohan Mehta", role: "Manager", username: "rohan@demo.test", password: "rohan123" },
];

// FAKE demo API key for GET /api/reports. Real keys are secrets kept on a server, never in React code.
const DEMO_API_KEY = "demo-key-123";

// Tokens are random strings kept in server memory: token -> user id.
// Real apps use SIGNED tokens (for example JWT) and send them in httpOnly cookies, so
// JavaScript on the page cannot read them. We keep it simple for teaching.
const sessions = new Map<string, number>();

type Reply = (status: number, body?: unknown) => void;
type Body = Record<string, unknown>;

function readBody(req: IncomingMessage): Promise<Body> {
  return new Promise((resolve) => {
    let text = "";
    req.on("data", (chunk) => (text += chunk));
    req.on("end", () => {
      try {
        resolve(text ? JSON.parse(text) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const LEAVE_TYPES: LeaveType[] = ["Annual", "Sick", "Casual", "Flexi"];
const STATUSES = ["Pending", "Approved", "Rejected", "Cancelled"];
const publicUser = ({ id, name, role }: DemoUser): User => ({ id, name, role });

export function mockApi(): Plugin {
  // Day 3 data (open API)
  let demoLeaves: LeaveRequest[] = structuredClone(sampleLeaves);
  let demoNextId = Math.max(...demoLeaves.map((leave) => leave.id)) + 1;

  // Day 4 data (secured API): the sample leaves plus two for the Manager
  const leaves: LeaveRequest[] = [
    ...structuredClone(sampleLeaves),
    { id: 8, employee: "Rohan Mehta", type: "Annual", startDate: "2026-12-07", endDate: "2026-12-11", reason: "Family trip", status: "Pending" },
    { id: 9, employee: "Rohan Mehta", type: "Sick", startDate: "2026-09-14", endDate: "2026-09-14", reason: "Migraine", status: "Approved" },
  ];
  let nextId = 10;

  // parts = ["demo", "leaves", "3"]
  function demoApi(parts: string[], method: string, url: URL, body: Body, send: Reply) {
    const id = parts[2] === undefined ? undefined : Number(parts[2]);
    const index = demoLeaves.findIndex((leave) => leave.id === id);
    const notFound = { error: `Leave request ${parts[2]} was not found` };

    if (id === undefined && method === "GET") {
      if (url.searchParams.get("empty") === "1") return send(200, []);
      const status = url.searchParams.get("status");
      const type = url.searchParams.get("type");
      return send(200, demoLeaves.filter((l) => (!status || l.status === status) && (!type || l.type === type)));
    }
    if (id === undefined && method === "POST") {
      const { employee, type, startDate, endDate, reason } = body as Record<string, string>;
      if (!employee || !reason || !startDate || !endDate || !LEAVE_TYPES.includes(type as LeaveType)) {
        return send(400, { error: "employee, type, startDate, endDate and reason are required" });
      }
      if (endDate < startDate) return send(400, { error: "End date is before start date" });
      const created: LeaveRequest = { id: demoNextId++, employee, type: type as LeaveType, startDate, endDate, reason, status: "Pending" };
      demoLeaves.push(created);
      return send(201, created);
    }
    if (id !== undefined && method === "GET") return index === -1 ? send(404, notFound) : send(200, demoLeaves[index]);
    if (id !== undefined && method === "PATCH") {
      if (index === -1) return send(404, notFound);
      const { status, type } = body as Record<string, string | undefined>;
      if (status !== undefined && !STATUSES.includes(status)) return send(400, { error: `status must be one of: ${STATUSES.join(", ")}` });
      if (type !== undefined && !LEAVE_TYPES.includes(type as LeaveType)) return send(400, { error: `type must be one of: ${LEAVE_TYPES.join(", ")}` });
      const merged = { ...demoLeaves[index], ...body, id: demoLeaves[index].id } as LeaveRequest;
      if (merged.endDate < merged.startDate) return send(400, { error: "End date is before start date" });
      if (!merged.reason) return send(400, { error: "reason is required" });
      demoLeaves[index] = merged;
      return send(200, merged);
    }
    if (id !== undefined && method === "DELETE") {
      if (index === -1) return send(404, notFound);
      demoLeaves = demoLeaves.filter((leave) => leave.id !== id);
      return send(204);
    }
    return send(405, { error: `${method} is not supported here` });
  }

  function login(body: Body, send: Reply) {
    const found = demoUsers.find((u) => u.username === body.username && u.password === body.password);
    if (!found) return send(401, { message: "Wrong username or password" });
    const token = randomUUID();
    sessions.set(token, found.id);
    return send(200, { token, user: publicUser(found) });
  }

  function currentUser(req: IncomingMessage): DemoUser | undefined {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    return demoUsers.find((u) => u.id === sessions.get(token));
  }

  // Days a person has already used or reserved in one calendar year (Pending and Approved count)
  const daysUsed = (name: string, type: LeaveType, year: string) =>
    leaves
      .filter((l) => l.employee === name && l.type === type && l.startDate.startsWith(year) && (l.status === "Pending" || l.status === "Approved"))
      .reduce((sum, l) => sum + workingDays(l.startDate, l.endDate), 0);

  // Rules. Status codes: 401 not signed in, 403 signed in but not allowed, 404 not found
  // (or not yours), 400 invalid input, 409 conflicts with existing data.
  // parts = ["leaves", "3"]
  function secureLeaves(user: DemoUser, parts: string[], method: string, url: URL, body: Body, send: Reply) {
    const isManager = user.role === "Manager";
    const id = parts[1] === undefined ? undefined : Number(parts[1]);
    const leave = leaves.find((l) => l.id === id);
    // Other people's requests look like they do not exist, so ids cannot be guessed.
    const visible = leave && (isManager || leave.employee === user.name) ? leave : undefined;
    const notFound = { message: `Leave request ${parts[1]} was not found` };

    if (id === undefined && method === "GET") {
      if (url.searchParams.get("empty") === "1") return send(200, []);
      const team = url.searchParams.get("scope") === "team";
      if (team && !isManager) return send(403, { message: "Only a Manager can see team requests" });
      const status = url.searchParams.get("status");
      const type = url.searchParams.get("type");
      return send(
        200,
        leaves.filter((l) => (team || l.employee === user.name) && (!status || l.status === status) && (!type || l.type === type)),
      );
    }

    if (id === undefined && method === "POST") {
      const { type, startDate, endDate, reason } = body as Record<string, string>;
      if (!LEAVE_TYPES.includes(type as LeaveType) || !startDate || !endDate || !reason?.trim()) {
        return send(400, { message: "Type, start date, end date and reason are required" });
      }
      if (endDate < startDate) return send(400, { message: "End date is before start date" });
      const days = workingDays(startDate, endDate);
      if (days === 0) return send(400, { message: "Those dates have no working days" });
      const limit = ALLOWANCE[type as LeaveType];
      const used = daysUsed(user.name, type as LeaveType, startDate.slice(0, 4));
      if (limit !== null && used + days > limit) {
        return send(400, { message: `Not enough ${type} leave: ${limit - used} days left, you asked for ${days}` });
      }
      const clash = leaves.find(
        (l) => l.employee === user.name && (l.status === "Pending" || l.status === "Approved") && datesOverlap(startDate, endDate, l.startDate, l.endDate),
      );
      if (clash) return send(409, { message: `These dates overlap your ${clash.status.toLowerCase()} ${clash.type} request #${clash.id}` });
      // The employee is always the signed-in user: never trust a name sent by the browser
      const created: LeaveRequest = { id: nextId++, employee: user.name, type: type as LeaveType, startDate, endDate, reason: reason.trim(), status: "Pending" };
      leaves.push(created);
      return send(201, created);
    }

    if (id !== undefined && method === "GET") return visible ? send(200, visible) : send(404, notFound);

    if (id !== undefined && method === "PATCH") {
      const status = body.status;
      if (status !== "Approved" && status !== "Rejected" && status !== "Cancelled") {
        return send(400, { message: "Status must be Approved, Rejected or Cancelled" });
      }
      // Role first: an Employee may never approve or reject, whoever the request belongs to
      if (status !== "Cancelled" && !isManager) return send(403, { message: "Only a Manager can approve or reject requests" });
      if (!visible) return send(404, notFound);
      if (status === "Cancelled") {
        if (visible.employee !== user.name) return send(403, { message: "You can only cancel your own requests" });
        if (visible.status !== "Pending") return send(409, { message: "Only a pending request can be cancelled" });
      } else {
        if (visible.status !== "Pending") return send(409, { message: "Only a pending request can be approved or rejected" });
      }
      visible.status = status;
      return send(200, visible);
    }

    return send(405, { message: `${method} is not supported here` });
  }

  return {
    name: "mock-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const parts = url.pathname.split("/").filter(Boolean); // ["leaves", "3"]
        const method = req.method ?? "GET";
        const send: Reply = (status, body) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(status === 204 ? "" : JSON.stringify(body));
        };

        const body = await readBody(req);
        await new Promise((resolve) => setTimeout(resolve, Number(url.searchParams.get("delay") ?? 600)));

        const route = parts[0];
        if (url.searchParams.get("fail") === "1" && route !== "login") {
          const message = "Server error: the leave service is unavailable";
          return send(500, { error: message, message });
        }
        if (route === "demo" && parts[1] === "leaves") return demoApi(parts, method, url, body, send);
        if (route === "login" && method === "POST") return login(body, send);

        // API key demo: a key identifies an APPLICATION (not a person). Sent as an "x-api-key" header.
        // Missing key = 401 (who are you?), wrong key = 403 (known format, but not allowed).
        if (route === "reports" && method === "GET") {
          const key = req.headers["x-api-key"];
          if (!key) return send(401, { message: "Missing API key: send it in the x-api-key header" });
          if (key !== DEMO_API_KEY) return send(403, { message: "This API key is not valid" });
          return send(200, { message: "Key accepted", pendingRequests: leaves.filter((l) => l.status === "Pending").length });
        }

        // Everything below needs a valid token
        const user = currentUser(req);
        if (!user) return send(401, { message: "You are not signed in, or your session has ended" });
        if (route === "me" && method === "GET") return send(200, publicUser(user));
        if (route === "leaves") return secureLeaves(user, parts, method, url, body, send);
        return send(404, { message: "Unknown API route" });
      });
    },
  };
}
