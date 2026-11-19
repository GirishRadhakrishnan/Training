import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
//after install Tanstack
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import App from "./App";

//after install Tanstack
// One cache for the whole app. retry: false makes errors show immediately in the demos.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* //after install Tanstack */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
