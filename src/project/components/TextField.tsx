import type { ComponentProps } from "react";

// React 19: "ref" is a normal prop on function components (no forwardRef needed).
type Props = ComponentProps<"input"> & { id: string; label: string; error?: string };

// Label + input + error line, wired together with aria-invalid and aria-describedby
export default function TextField({ id, label, error, ref, ...inputProps }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={ref} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...inputProps} />
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
