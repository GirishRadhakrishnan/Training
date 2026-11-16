import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mockApi } from "./server/mockApi";

// The mock REST API (Day 3 CRUD + Day 4 login and roles) lives in server/mockApi.ts.
export default defineConfig({
  plugins: [react(), mockApi()],
});
