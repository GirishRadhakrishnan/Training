import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { sampleLeaves } from "./src/sample/leaves";
import type { LeaveRequest } from "./src/types";

// Mock REST API for Day 3. It lives in memory inside the dev server, so data
// resets when you restart `npm run dev`. It is NOT part of the React app.
//
//   GET    /api/leaves            ?status=Pending &type=Annual
//   GET    /api/leaves/:id        404 JSON when missing
//   POST   /api/leaves            validates, returns 201 and the new item (Pending)
//   PATCH  /api/leaves/:id        body: { "status": "Cancelled" }
//   DELETE /api/leaves/:id
//
// Simulate real conditions with query parameters on any request:
//   ?delay=2000  wait 2 s (default 600 ms)   ?fail=1  answer 500   ?empty=1  GET list returns []
function mockLeaveApi(): Plugin {
  let leaves: LeaveRequest[] = structuredClone(sampleLeaves);
  let nextId = Math.max(...leaves.map((leave) => leave.id)) + 1;
  const statuses = ["Pending", "Approved", "Rejected", "Cancelled"];
  const types = ["Annual", "Sick", "Casual", "Flexi"];

  return {
    name: "mock-leave-api",
    configureServer(server) {
      server.middlewares.use("/api", async (req, res) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const parts = url.pathname.split("/").filter(Boolean); // ["leaves"] or ["leaves", "3"]
        const method = req.method ?? "GET";

        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(status === 204 ? "" : JSON.stringify(body));
        };

        // Read the JSON body (only POST and PATCH have one)
        const readBody = async (): Promise<Record<string, unknown>> => {
          let text = "";
          for await (const chunk of req) text += chunk;
          try {
            return text ? JSON.parse(text) : {};
          } catch {
            return {};
          }
        };

        // Simulated network delay
        const delay = Number(url.searchParams.get("delay") ?? 600);
        await new Promise((resolve) => setTimeout(resolve, delay));

        if (parts[0] !== "leaves") return send(404, { error: "Unknown API route" });
        if (url.searchParams.get("fail") === "1") {
          return send(500, { error: "Server error: the leave service is unavailable" });
        }

        const id = parts[1] === undefined ? undefined : Number(parts[1]);
        const index = leaves.findIndex((leave) => leave.id === id);
        const notFound = { error: `Leave request ${parts[1]} was not found` };

        if (id === undefined && method === "GET") {
          if (url.searchParams.get("empty") === "1") return send(200, []);
          const status = url.searchParams.get("status");
          const type = url.searchParams.get("type");
          return send(
            200,
            leaves.filter(
              (leave) => (!status || leave.status === status) && (!type || leave.type === type),
            ),
          );
        }

        if (id === undefined && method === "POST") {
          const body = await readBody();
          const { employee, type, startDate, endDate, reason } = body as Record<string, string>;
          if (!employee || !reason || !startDate || !endDate || !types.includes(type)) {
            return send(400, { error: "employee, type, startDate, endDate and reason are required" });
          }
          if (endDate < startDate) return send(400, { error: "End date is before start date" });
          const created: LeaveRequest = {
            id: nextId++,
            employee,
            type: type as LeaveRequest["type"],
            startDate,
            endDate,
            reason,
            status: "Pending",
          };
          leaves.push(created);
          return send(201, created);
        }

        if (id !== undefined && method === "GET") {
          return index === -1 ? send(404, notFound) : send(200, leaves[index]);
        }

        if (id !== undefined && method === "PATCH") {
          if (index === -1) return send(404, notFound);
          // Partial update: only the fields present in the body change
          const body = await readBody();
          const { status, type, startDate, endDate } = body as Record<string, string | undefined>;
          if (status !== undefined && !statuses.includes(status)) {
            return send(400, { error: `status must be one of: ${statuses.join(", ")}` });
          }
          if (type !== undefined && !types.includes(type)) {
            return send(400, { error: `type must be one of: ${types.join(", ")}` });
          }
          const merged = { ...leaves[index], ...body, id: leaves[index].id } as LeaveRequest;
          if (merged.endDate < merged.startDate) return send(400, { error: "End date is before start date" });
          if (!merged.reason) return send(400, { error: "reason is required" });
          leaves[index] = merged;
          return send(200, merged);
        }

        if (id !== undefined && method === "DELETE") {
          if (index === -1) return send(404, notFound);
          leaves = leaves.filter((leave) => leave.id !== id);
          return send(204, null);
        }

        return send(405, { error: `${method} is not supported here` });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockLeaveApi()],
});
