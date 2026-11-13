// DAY 3 · TOPIC 11: Nested routes and params
//
// A layout route has no path of its own. It draws shared UI (heading, nav) and an
// <Outlet /> where the matching child route appears.
//   <Route element={<Layout />}>
//     <Route path="leaves" element={<List />} />
//     <Route path="leaves/:id" element={<Detail />} />
//   </Route>
// ":id" is a URL parameter. useParams() returns it as a STRING, so convert with
// Number(). "abc" gives NaN: handle that too.
//
// The detail page loads its own data with useQuery, keyed by the id. It handles
// loading, a 404 (not found), other errors with Retry, and shows a Back link.
// MemoryRouter again, so the training app's URL hash is not touched (see topic 6).

import { Link, MemoryRouter, NavLink, Outlet, Route, Routes, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError, getLeave, getLeaves } from "../../api/leaves";
import { formatRange, workingDays } from "../../lib/leave";

function Layout() {
  return (
    <div>
      <nav className="row" aria-label="Demo">
        <NavLink to="/leaves">My leaves</NavLink>
        <Link to="/leaves/999">Open request 999 (does not exist)</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

function List() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["leaves"],
    queryFn: ({ signal }) => getLeaves({}, undefined, signal),
  });

  if (isPending) return <p className="muted">Loading leave requests…</p>;
  if (error) {
    return (
      <p className="message error">
        Could not load leave requests: {error.message} <button onClick={() => refetch()}>Retry</button>
      </p>
    );
  }
  if (data.length === 0) return <p>You have no leave requests yet.</p>;
  return (
    <ul>
      {data.map((leave) => (
        <li key={leave.id}>
          <Link to={`/leaves/${leave.id}`}>
            {leave.type}, {formatRange(leave.startDate, leave.endDate)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Detail() {
  const { id } = useParams(); // string | undefined
  const leaveId = Number(id);
  const valid = Number.isInteger(leaveId) && leaveId > 0;

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["leaves", leaveId],
    queryFn: ({ signal }) => getLeave(leaveId, undefined, signal),
    enabled: valid, // do not call the API with NaN
  });

  const back = <Link to="/leaves">Back to My leaves</Link>;

  if (!valid) return <p className="message error">"{id}" is not a valid request number. {back}</p>;
  if (isPending) return <p className="muted">Loading request {leaveId}…</p>;
  if (error instanceof ApiError && error.status === 404) {
    return <p className="message error">Request {leaveId} was not found. {back}</p>;
  }
  if (error) {
    return (
      <p className="message error">
        Could not load request {leaveId}: {error.message} <button onClick={() => refetch()}>Retry</button> {back}
      </p>
    );
  }
  return (
    <div className="card">
      <h3>
        {data.type} leave <span className={`badge ${data.status.toLowerCase()}`}>{data.status}</span>
      </h3>
      <p>{data.employee}: {formatRange(data.startDate, data.endDate)} ({workingDays(data.startDate, data.endDate)} working days)</p>
      <p className="muted">{data.reason}</p>
      {back}
    </div>
  );
}

export default function NestedRoutesAndParams() {
  return (
    <div>
      <h2>Nested routes and params</h2>
      <div className="demo">
        <MemoryRouter initialEntries={["/leaves"]}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="leaves" element={<List />} />
              <Route path="leaves/:id" element={<Detail />} />
              <Route path="*" element={<p className="message error">Page not found.</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </div>
      <p className="try">
        Try it: open a request, then use the Back link. In Detail, replace Number(id) with the
        raw string in the queryKey. What breaks when you compare it to a number?
      </p>
    </div>
  );
}
