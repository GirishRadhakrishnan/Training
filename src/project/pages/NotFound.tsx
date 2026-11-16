import { Link, useLocation } from "react-router";

// 404: no route matches this address.
export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <div className="message error" role="alert">
      <h1>404: page not found</h1>
      <p>There is no page at {pathname}.</p>
      <Link to="/leaves">Go to My leaves</Link>
    </div>
  );
}
