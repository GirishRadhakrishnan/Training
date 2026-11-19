// DAY 3 · TOPIC 5: What becomes difficult as the app grows
//
// fetch inside useEffect / an event handler works for ONE screen. Copy it to 20 screens and
// five problems appear. Each part shows the problem on the left, and on the right how we
// fix it by hand with useState and useEffect (no library):
//   1. Loading state: the user clicks and nothing seems to happen.
//   2. Error handling: a failed request is silent, or the old error never goes away.
//   3. Caching and duplicate requests: two components fetch the same data twice.
//   4. Freshness and sync: the screen shows what the server said once and is never updated.
//   5. Race conditions: a slow old response arrives late and overwrites the newer one.
// Every fix works, but look at how much code and how many things to remember, per component.
// That is the cost TanStack Query removes. Next topic: the same five problems with useQuery.

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
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

type PartProps = { title: string; problem: string; left: ReactNode; right: ReactNode; leftNote: string; rightNote: string; action?: ReactNode };

function Part({ title, problem, left, right, leftNote, rightNote, action }: PartProps) {
  return (
    <section>
      <h3>{title}</h3>
      <p>{problem}</p>
      {action}
      <div className="cols-2">
        <div>
          <h4>The problem</h4>
          <div className="demo">{left}</div>
          <p className="note">{leftNote}</p>
        </div>
        <div>
          <h4>Handled by hand</h4>
          <div className="demo">{right}</div>
          <p className="note">{rightNote}</p>
        </div>
      </div>
    </section>
  );
}

// ---------- 1. Loading state ----------
function LoadingProblem() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  function load() {
    getLeaves({}, { delay: 2000 }).then(setLeaves); // arrives 2 seconds later, with no sign of progress
  }
  return (
    <div>
      <button onClick={load}>Load leave requests</button>
      {leaves && <LeaveList leaves={leaves} />}
    </div>
  );
}

function LoadingFixed() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [loading, setLoading] = useState(false); // extra state, for every request
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

// ---------- 2. Error handling ----------
function ErrorProblem({ fail }: { fail: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  function load() {
    getLeaves({}, { fail }).then(setLeaves); // a rejected promise is never handled
  }
  return (
    <div>
      <button onClick={load}>Load leave requests</button>
      {leaves && <LeaveList leaves={leaves} />}
    </div>
  );
}

function ErrorFixed({ fail }: { fail: boolean }) {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // one more state
  function load() {
    setLoading(true);
    setError(null); // forget this line and the old error stays on screen after a successful retry
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
      left={<ErrorProblem fail={fail} />}
      right={<ErrorFixed fail={fail} />}
      leftNote="The request fails and the user sees nothing at all (check the console for the unhandled error)."
      rightNote="Needs an error state, a message, a Retry, and clearing the error at the start of every request. Repeated in every component."
    />
  );
}

// ---------- 3. Caching and duplicate requests ----------
// Request counter for the demo only
let counts = { problem: 0, fixed: 0 };
const listeners = new Set<() => void>();
function count(kind: "problem" | "fixed") {
  counts = { ...counts, [kind]: counts[kind] + 1 };
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Problem: every component fetches for itself
function useLeavesEverywhere() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  useEffect(() => {
    let ignore = false;
    count("problem");
    getLeaves().then((data) => {
      if (!ignore) setLeaves(data);
    });
    return () => {
      ignore = true;
    };
  }, []);
  return leaves;
}

// Fix: our own cache outside React, plus one shared in-flight request
let cache: { data: LeaveRequest[]; savedAt: number } | null = null;
let inFlight: Promise<LeaveRequest[]> | null = null;
function getLeavesCached(): Promise<LeaveRequest[]> {
  if (cache && Date.now() - cache.savedAt < 30_000) return Promise.resolve(cache.data);
  if (!inFlight) {
    count("fixed");
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

function useLeavesShared() {
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

function CacheDemo({ kind }: { kind: "problem" | "fixed" }) {
  const [shown, setShown] = useState(false);
  const total = useSyncExternalStore(subscribe, () => counts)[kind];
  return (
    <div>
      <button onClick={() => setShown(!shown)}>{shown ? "Hide" : "Show"} panel</button>
      <p>
        Requests sent: <b>{total}</b>
      </p>
      {shown && <Panel useLeaves={kind === "problem" ? useLeavesEverywhere : useLeavesShared} />}
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

function FreshProblem() {
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  useEffect(() => {
    getLeaves().then(setLeaves); // once, on mount, and never again
  }, []);
  return leaves ? <LeaveList leaves={leaves} /> : <p className="muted">Loading…</p>;
}

function FreshFixed() {
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

function RaceProblem() {
  const [status, setStatus] = useState<LeaveStatus>("Pending");
  const [leaves, setLeaves] = useState<LeaveRequest[] | null>(null);
  useEffect(() => {
    // No cleanup: whichever response arrives LAST wins, not the one that was asked LAST
    getLeaves({ status }, { delay: DELAY[status] }).then(setLeaves);
  }, [status]);
  return (
    <>
      <StatusPicker status={status} onPick={setStatus} />
      {leaves ? <LeaveList leaves={leaves} /> : <p className="muted">Loading…</p>}
    </>
  );
}

function RaceFixed() {
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

export default function WhatGetsHardAsAppGrows() {
  return (
    <div>
      <h2>What becomes difficult as the app grows</h2>
      <Part
        title="1. Loading state"
        problem="Click Load leave requests. The data arrives after 2 seconds."
        left={<LoadingProblem />}
        right={<LoadingFixed />}
        leftNote="For 2 seconds nothing happens. The user clicks again, or thinks the app is broken."
        rightNote="Needs a loading state, set before the request and cleared after it, plus a disabled button. For every request."
      />
      <ErrorDemo />
      <Part
        title="3. Caching and duplicate requests"
        problem="A badge and a list both need the leaves. Click Show panel, Hide, Show again, and watch the counter."
        left={<CacheDemo kind="problem" />}
        right={<CacheDemo kind="fixed" />}
        leftNote="Two requests per Show (four in dev, StrictMode runs effects twice). Hide and Show fetches again."
        rightNote="One request, then none for 30 seconds. But we now own a cache, an expiry and a shared promise, and nothing clears the cache after an edit."
      />
      <Part
        title="4. Freshness and sync"
        problem="Press the button, then watch both lists. The server data changed; who notices?"
        action={<ChangeElsewhere />}
        left={<FreshProblem />}
        right={<FreshFixed />}
        leftNote="Stale until the user reloads the page. Nothing tells the component the data is old."
        rightNote="A timer, a visibility listener and a cleanup for both. Every screen that needs fresh data repeats it."
      />
      <Part
        title="5. Race conditions"
        problem="Pending answers slowly (2.5 s), Approved quickly. Click Approved right after the page shows Pending."
        left={<RaceProblem />}
        right={<RaceFixed />}
        leftNote="Approved is selected, but the late Pending response overwrites it. The screen lies."
        rightNote="Needs an AbortController, a cleanup, an AbortError check and a reset of the list. Easy to forget in one of 20 effects."
      />
      <p className="try">
        Try it: in part 3, make the panel render a third component that calls useLeavesEverywhere(). How many requests
        are sent now? Then do the same with useLeavesShared().
      </p>
    </div>
  );
}
