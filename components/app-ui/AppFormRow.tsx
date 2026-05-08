import type { ReactNode } from "react";

type AppFormRowProps = Readonly<{
  label: string;
  labelFor?: string;
  helperText?: string;
  errorText?: string | null;
  children: ReactNode;
}>;

export function AppFormRow({ label, labelFor, helperText, errorText, children }: AppFormRowProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <label htmlFor={labelFor} className="app-form-row__label">
        {label}
      </label>
      {children}
      {errorText ? (
        <p className="app-form-row__error" role="alert">
          {errorText}
        </p>
      ) : helperText ? (
        <p className="app-form-row__hint">{helperText}</p>
      ) : null}
    </div>
  );
}
