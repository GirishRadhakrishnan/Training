// The three states every data screen needs besides "has data".

export function Loading({ what }: { what: string }) {
  return (
    <p className="muted" role="status">
      Loading {what}…
    </p>
  );
}

export function LoadError({ what, error, onRetry }: { what: string; error: Error; onRetry: () => void }) {
  return (
    <p className="message error" role="alert">
      Could not load {what}: {error.message} <button onClick={onRetry}>Retry</button>
    </p>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="pj-empty">{children}</p>;
}
