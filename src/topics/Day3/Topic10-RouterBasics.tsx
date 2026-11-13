// DAY 3 · TOPIC 10: Router basics
//
// React Router maps the URL to components. In declarative mode you write:
//   <Routes> holds <Route path="/leaves" element={<Leaves />} /> entries.
//   <Link to="/leaves"> and <NavLink> change the URL without a page reload.
//   NavLink also knows when it is the current page (class "active").
//   useNavigate() gives a function for code-driven moves, e.g. after a form save.
//   path="*" matches everything else: that is your 404 page.
// Import everything from "react-router" (not react-router-dom).
//
// This training app already uses the URL hash (#Day3/Topic10-...) to pick topics.
// A normal browser router would fight over the same URL. So the demos use
// MemoryRouter, which keeps its "URL" in memory. In a real app you would use
// BrowserRouter, or createBrowserRouter in data mode.

import { Link, MemoryRouter, NavLink, Route, Routes, useLocation, useNavigate } from "react-router";

function Home() {
  return <p>Welcome. Use the links above.</p>;
}

function Leaves() {
  const navigate = useNavigate();
  return (
    <div>
      <p>Your leave requests would be listed here.</p>
      <button onClick={() => navigate("/apply")}>Apply for leave (useNavigate)</button>
    </div>
  );
}

function Apply() {
  const navigate = useNavigate();
  return (
    <div>
      <p>Pretend this is the form.</p>
      <button className="primary" onClick={() => navigate("/leaves")}>
        Save and go to My leaves
      </button>
    </div>
  );
}

function NotFound() {
  const { pathname } = useLocation();
  return (
    <p className="message error">
      No page at {pathname}. <Link to="/">Go home</Link>
    </p>
  );
}

function DemoApp() {
  const { pathname } = useLocation();
  // NavLink adds the class "active" for the current page; aria-current is added too
  const linkClass = ({ isActive }: { isActive: boolean }) => (isActive ? "topic-link active" : "topic-link");

  return (
    <div>
      <p className="muted">In-memory URL: {pathname}</p>
      <nav className="row" aria-label="Demo">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/leaves" className={linkClass}>My leaves</NavLink>
        <NavLink to="/apply" className={linkClass}>Apply</NavLink>
        <Link to="/payroll">Broken link</Link>
      </nav>
      <div className="card">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

export default function RouterBasics() {
  return (
    <div>
      <h2>Router basics</h2>
      <div className="demo">
        <MemoryRouter>
          <DemoApp />
        </MemoryRouter>
      </div>
      <p className="try">
        Try it: add a fourth page, "Team", with its own Route and NavLink. Then click "Broken
        link" and read the 404 message. Does the sidebar or the browser address bar change?
      </p>
    </div>
  );
}
