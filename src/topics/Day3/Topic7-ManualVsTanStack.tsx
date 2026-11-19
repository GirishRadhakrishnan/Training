// DAY 3 · TOPIC 7: The same five problems, solved with TanStack Query
//
// Topic 5 showed five problems of fetching with useEffect. Here are the same five examples again.
// Left: how we handled each one by hand (the code from Topic 5). Right: the same screen with useQuery.
// Compare what each side has to write and what it has to remember:
//   1. Loading state         2. Error handling         3. Caching and duplicate requests
//   4. Freshness and sync    5. Race conditions
// Reading the right side: isFetching = a request is running, error = the last request failed,
// data = the cached result, queryKey = the cache address (one key, one cache entry).
// Every screen should still show loading, error (with Retry) and empty states in specific words.

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LeaveRequest, LeaveStatus } from "../../types";
import { getLeaves, updateLeaveStatus } from "../../api/leaves";

function LeaveList({ leaves }: { leaves: LeaveRequest[] }) {
  if (leaves.length === 0) return <p className="muted">No requests found.</p>;
  return (
    <ul>
      {leaves.slice(0, 3).map((leave) => (
        <li key={leave.id}>
          {leave.employee}: {leave.type} <span className={`badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
        </li>
      ))}
    </ul>
  );
}

type PartProps = {
  title: string;
  problem: string;
  left: ReactNode;
  right: ReactNode;
  leftNote: string;
  rightNote: string;
  difference: string;
  action?: ReactNode;
};

function Part({ title, problem, left, right, leftNote, rightNote, difference, action }: PartProps) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{problem}</p>
      {action}
      <div className="cols-2">
        <div>
          <h4>Without TanStack</h4>
          <div className="demo">{left}</div>
        </div>
        <div>
          <h4>With TanStack Query</h4>
          <div className="demo">{right}</div>
        </div>
      </div>
      <div className="note">
        <p>
          <b>Without TanStack:</b> {leftNote}
        </p>
        <p>
          <b>With TanStack Query:</b> {rightNote}
        </p>
        <p>
          <b>The difference:</b> {difference}
        </p>
      </div>
    </section>
  );
}

// ---------- 1. Loading state ----------
function LoadingManual() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  function load() {
    setLoading(true);
    getLeaves({}, { delay: 2000 })
      .then(setLeaves)
      .finally(() => setLoading(false));
  }
  return (
    <div>
      <button disabled={loading} onClick={load}>
        Load leave requests
      </button>
      {loading && <p className="muted">Loading leave requests…</p>}
      {leaves && <LeaveList leaves={leaves} />}
    </div>
  );
}

function LoadingQuery() {
  // enabled: false = do not run by itself, only when we call refetch (on click)
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["leaves", "cmp-loading"],
    queryFn: () => getLeaves({}, { delay: 2000 }),
    enabled: false,
  });
  return (
    <div>
      <button disabled={isFetching} onClick={() => refetch()}>
        Load leave requests
      </button>
      {isFetching && <p className="muted">Loading leave requests…</p>}
      {data && <LeaveList leaves={data} />}
    </div>
  );
}

// ---------- 2. Error handling ----------
function ErrorManual({ fail }: { fail: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function load() {
    setLoading(true);
    setError(null); // forget this and the old error stays after a successful retry
    getLeaves({}, { fail })
      .then(setLeaves)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }
  return (
    <div>
      <button disabled={loading} onClick={load}>
        {error ? "Retry" : "Load leave requests"}
      </button>
      {loading && <p className="muted">Loading leave requests…</p>}
      {error && <p className="message error">Could not load leave requests: {error}</p>}
      {leaves && !error && <LeaveList leaves={leaves} />}
    </div>
  );
}

function ErrorQuery({ fail }: { fail: boolean }) {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey: ["leaves", "cmp-error", fail],
    queryFn: () => getLeaves({}, { fail }),
    enabled: false,
  });
  return (
    <div>
      <button disabled={isFetching} onClick={() => refetch()}>
        {error ? "Retry" : "Load leave requests"}
      </button>
      {isFetching && <p className="muted">Loading leave requests…</p>}
      {error && !isFetching && <p className="message error">Could not load leave requests: {error.message}</p>}
      {data && !error && <LeaveList leaves={data} />}
    </div>
  );
}

function ErrorDemo() {
  const [fail, setFail] = useState(true);
  return (
    <Part
      title="2. Error handling"
      problem="Keep the box ticked and click Load. Then untick it and click again."
      action={
        <label>
          <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} /> Server is failing
        </label>
      }
      left={<ErrorManual fail={fail} />}
      right={<ErrorQuery fail={fail} />}
      leftNote="Own error state, own message, and a setError(null) to remember at the start of every request."
      rightNote="error comes from the hook and clears itself when a request succeeds. Retry is just refetch()."
      difference="Three useState calls and a catch block shrink to the hook's error value. The 'old error stays on screen' bug cannot happen, because there is no flag for you to forget to reset."
    />
  );
}

// ---------- 3. Caching and duplicate requests ----------
// Request counter for the demo only
let counts = { manual: 0, query: 0 };
const listeners = new Set<() => void>();
function count(kind: "manual" | "query") {
  counts = { ...counts, [kind]: counts[kind] + 1 };
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Manual: our own cache outside React, plus one shared in-flight request
let cache: { data: LeaveRequest[]; savedAt: number } | null = null;
let inFlight: Promise<LeaveRequest[]> | null = null;
function getLeavesCached(): Promise<LeaveRequest[]> {
  if (cache && Date.now() - cache.savedAt < 30_000) return Promise.resolve(cache.data);
  if (!inFlight) {
    count("manual");
    inFlight = getLeaves()
      .then((data) => {
        cache = { data, savedAt: Date.now() };
        return data;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

function useLeavesManual() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(() => cache?.data ?? null);
  useEffect(() => {
    let ignore = false;
    getLeavesCached().then((data) => {
      if (!ignore) setLeaves(data);
    });
    return () => {
      ignore = true;
    };
  }, []);
  return leaves;
}

function useLeavesQuery() {
  const { data } = useQuery({
    queryKey: ["leaves", "cmp-cache"], // same key = shared cache entry = one request
    queryFn: () => {
      count("query");
      return getLeaves();
    },
    staleTime: 30_000,
  });
  return data ?? null;
}

function Panel({ useLeaves }: { useLeaves: () => LeaveRequest[] | null }) {
  const badge = useLeaves();
  const list = useLeaves();
  return (
    <>
      <p>Pending: {badge ? badge.filter((l) => l.status === "Pending").length : "…"}</p>
      {list ? <LeaveList leaves={list} /> : <p className="muted">Loading…</p>}
    </>
  );
}

function CacheDemo({ kind }: { kind: "manual" | "query" }) {
  const [shown, setShown] = useState(false);
  const total = useSyncExternalStore(subscribe, () => counts)[kind];
  return (
    <div>
      <button onClick={() => setShown(!shown)}>{shown ? "Hide" : "Show"} panel</button>
      <p>
        Requests sent: <b>{total}</b>
      </p>
      {shown && <Panel useLeaves={kind === "manual" ? useLeavesManual : useLeavesQuery} />}
    </div>
  );
}

// ---------- 4. Freshness and sync ----------
function ChangeElsewhere() {
  const [busy, setBusy] = useState(false);
  // Pretends to be another user: flips the first request between Pending and Approved
  async function change() {
    setBusy(true);
    try {
      const [first] = await getLeaves();
      await updateLeaveStatus(first.id, first.status === "Approved" ? "Pending" : "Approved");
    } catch {
      // demo only
    } finally {
      setBusy(false);
    }
  }
  return (
    <button disabled={busy} onClick={change}>
      Simulate: someone else changes the first request
    </button>
  );
}

function FreshManual() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  useEffect(() => {
    let ignore = false;
    function load() {
      getLeaves().then((data) => {
        if (!ignore) setLeaves(data);
      });
    }
    load();
    const timer = setInterval(load, 3000); // poll
    const onVisible = () => {
      if (document.visibilityState === "visible") load(); // refresh when the user returns to the tab
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ignore = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return leaves ? <LeaveList leaves={leaves} /> : <p className="muted">Loading…</p>;
}

function FreshQuery() {
  const { data } = useQuery({
    queryKey: ["leaves", "cmp-fresh"],
    queryFn: () => getLeaves(),
    refetchInterval: 3000, // refetch on window focus is already the default
  });
  return data ? <LeaveList leaves={data} /> : <p className="muted">Loading…</p>;
}

// ---------- 5. Race conditions ----------
const STATUSES: LeaveStatus[] = ["Pending", "Approved", "Rejected"];
// Pending is slow on purpose, so its answer arrives AFTER a quick click on Approved
const DELAY: Record<LeaveStatus, number> = { Pending: 2500, Approved: 200, Rejected: 200, Cancelled: 200 };

function StatusPicker({ status, onPick }: { status: LeaveStatus; onPick: (s: LeaveStatus) => void }) {
  return (
    <div>
      {STATUSES.map((s) => (
        <button key={s} aria-pressed={s === status} onClick={() => onPick(s)}>
          {s}
        </button>
      ))}
      <p>
        Selected: <b>{status}</b>
      </p>
    </div>
  );
}

function RaceManual() {
  const [status, setStatus] = useState<LeaveStatus>("Pending");
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    getLeaves({ status }, { delay: DELAY[status] }, controller.signal)
      .then(setLeaves)
      .catch((e: Error) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => controller.abort(); // cancel the old request when status changes
  }, [status]);
  function pick(next: LeaveStatus) {
    setStatus(next);
    setLeaves(null); // do not show the previous status's rows under the new selection
  }
  return (
    <>
      <StatusPicker status={status} onPick={pick} />
      {leaves ? <LeaveList leaves={leaves} /> : <p className="muted">Loading {status.toLowerCase()} requests…</p>}
    </>
  );
}

function RaceQuery() {
  const [status, setStatus] = useState<LeaveStatus>("Pending");
  const { data } = useQuery({
    queryKey: ["leaves", "cmp-race", status], // each status has its own cache entry
    queryFn: ({ signal }) => getLeaves({ status }, { delay: DELAY[status] }, signal),
  });
  return (
    <>
      <StatusPicker status={status} onPick={setStatus} />
      {data ? <LeaveList leaves={data} /> : <p className="muted">Loading {status.toLowerCase()} requests…</p>}
    </>
  );
}

export default function ManualVsTanStack() {
  return (
    <div>
      <h2>The same five problems, solved with TanStack Query</h2>
      <Part
        title="1. Loading state"
        problem="Click Load leave requests. The data arrives after 2 seconds."
        left={<LoadingManual />}
        right={<LoadingQuery />}
        leftNote="Two useState calls (leaves, loading). We set loading to true before the request and to false in finally."
        rightNote="isFetching is the loading flag. No setState, no finally. Click again later: the old data stays on screen while it refreshes."
        difference="Roughly the same number of lines for this one case. The gain is what you no longer manage: the loading flag is never out of sync, and the same hook also gives you caching, error and cancel for free."
      />
      <ErrorDemo />
      <Part
        title="3. Caching and duplicate requests"
        problem="A badge and a list both need the leaves. Click Show panel, Hide, Show again, and watch the counter."
        left={<CacheDemo kind="manual" />}
        right={<CacheDemo kind="query" />}
        leftNote="A module-level cache, an expiry check and a shared promise: about 20 lines we have to test and maintain."
        rightNote="Both components use the same queryKey, so one request and one cache. staleTime sets how long it counts as fresh."
        difference="We replace our own cache code with one queryKey and one staleTime option. The manual cache also never clears after an edit; with TanStack, invalidateQueries does that."
      />
      <Part
        title="4. Freshness and sync"
        problem="Press the button, then watch both lists. Both should notice the change."
        action={<ChangeElsewhere />}
        left={<FreshManual />}
        right={<FreshQuery />}
        leftNote="A timer, a visibility listener and a cleanup for both."
        rightNote="One option: refetchInterval. Refetching when you return to the tab is on by default."
        difference="About 15 lines of timers and listeners become one option. Nothing to clean up, so nothing to leak."
      />
      <Part
        title="5. Race conditions"
        problem="Pending answers slowly (2.5 s), Approved quickly. Click Approved right after the page shows Pending."
        left={<RaceManual />}
        right={<RaceQuery />}
        leftNote="AbortController, a cleanup, an AbortError check and a reset of the list."
        rightNote="The queryKey includes status, so each status has its own data. We only pass the signal on; the old request is cancelled for us."
        difference="The data is picked by key, so a late answer can never land on the wrong screen. You can also click back to a status you saw before and see its cached rows at once."
      />
      <p className="try">
        Try it: in part 3, change staleTime to 0 and click Hide and Show. How many requests are sent now? Then raise it
        to 60_000 and try again.
      </p>
    </div>
  );
}
