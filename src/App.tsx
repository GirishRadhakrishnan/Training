import { lazy, Suspense } from "react";
import TopicBrowser from "./TopicBrowser";

// The project is loaded only when needed, so the topic pages stay light.
const ProjectApp = lazy(() => import("./project/ProjectApp"));

export default function App() {
  // Real paths (/project/...) belong to the project. The topics use the URL hash instead.
  if (window.location.pathname.startsWith("/project")) {
    return (
      <Suspense fallback={<p className="muted">Loading the project…</p>}>
        <ProjectApp />
      </Suspense>
    );
  }
  return <TopicBrowser projectHref="/project" />;
}
