import { Link } from "react-router";
import type { Role } from "../../types";

// 403: we know who you are, but your role may not open this page.
// (404 is different: there is nothing at this address.)
export default function NotAllowed({ needed }: { needed: Role }) {
  return (
    <div className="message error" role="alert">
      <h1>403: not allowed</h1>
      <p>This page is only for a {needed}. Your account does not have access.</p>
      <Link to="/leaves">Go to My leaves</Link>
    </div>
  );
}
