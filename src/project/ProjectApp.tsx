import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext";
import AppRoutes from "./routes";
import "./project.css";

// The project has its own cache and router. basename="/project" means every route below is
// relative to /project, so "/leaves" is really the address /project/leaves.
// BrowserRouter is fine here: unlike the topics, the project owns the whole URL.
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export default function ProjectApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/project">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
