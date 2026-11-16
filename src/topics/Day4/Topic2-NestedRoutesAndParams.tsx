// DAY 4 · TOPIC 2: Nested routes and params
//
// A layout route has no path of its own. It draws shared UI (nav) and an <Outlet />
// where the matching child route appears. An index route is the child shown at the
// layout's own URL. ":id" is a URL parameter: useParams() returns it as a STRING, so
// convert with Number(). "abc" gives NaN: handle that too.
// useSearchParams keeps the status filter in the URL (?status=Pending). A refresh or a
// shared link shows the same filtered list, which useState could never do.
// The detail page loads its own data with useQuery, keyed by the id. It handles loading,
// not found (a 404 ApiError), other errors with Retry, and a Back link that keeps the filter.
// MemoryRouter, so the training app's URL hash (#Day4/Topic2-...) is not touched.

import { Link, MemoryRouter, NavLink, Outlet, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ApiError, getLeave, getLeaves } from "../../api/leaves";
import { LEAVE_STATUSES, formatRange, workingDays } from "../../lib/leave";
import type { LeaveStatus } from "../../types";

function Layout() {
  return (
    <div>
      <nav className="row" aria-label="Demo">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/leaves">My leaves</NavLink>
        <Link to="/leaves/999">Open request 999 (does not exist)</Link>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

function List() {
  const [params, setParams] = useSearchParams();
  const status = LEAVE_STATUSES.find((s) => s === params.get("status")); // ignore junk values
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["leaves", { status }],
    queryFn: ({ signal }) => getLeaves({ status }, undefined, signal),
  });

  return (
    <div>
      <label>
        Status{" "}
        <select value={status ?? ""} onChange={(e) => setParams(e.target.value ? { status: e.target.value } : {})}>
          <option value="">All</option>
          {LEAVE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      {isPending && <p className="muted">Loading leave requests…</p>}
      {error && (
        <p className="message error">
          Could not load leave requests: {error.message} <button onClick={() => refetch()}>Retry</button>
        </p>
      )}
      {data?.length === 0 && <p>{status ? `You have no ${status} requests.` : "You have no leave requests yet."}</p>}
      <ul>
        {data?.map((leave) => (
          <li key={leave.id}>
            {/* state carries the filter to the detail page so Back can restore it */}
            <Link to={`/leaves/${leave.id}`} state={{ search: params.toString() }}>
              {leave.type}, {formatRange(leave.startDate, leave.endDate)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Detail() {
  const { id } = useParams(); // string | undefined
  const location = useLocation();
  const leaveId = Number(id);
  const valid = Number.isInteger(leaveId) && leaveId > 0;
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["leaves", leaveId],
    queryFn: ({ signal }) => getLeave(leaveId, undefined, signal),
    enabled: valid, // do not call the API with NaN
  });

  const search = (location.state as { search?: string } | null)?.search;
  const back = <Link to={{ pathname: "/leaves", search: search ?? "" }}>Back to My leaves</Link>;

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
  const status: LeaveStatus = data.status;
  return (
    <div className="card">
      <h3>{data.type} leave <span className={`badge ${status.toLowerCase()}`}>{status}</span></h3>
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
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<p>Home page. Open My leaves to see the list.</p>} />
              <Route path="leaves" element={<List />} />
              <Route path="leaves/:id" element={<Detail />} />
              <Route path="*" element={<p className="message error">Page not found.</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </div>
      <p className="try">
        Try it: choose the Pending filter, open a request, then use Back: is the filter still
        there? Then use Number(id) as a plain string in the queryKey and see what changes.
      </p>
    </div>
  );
}
