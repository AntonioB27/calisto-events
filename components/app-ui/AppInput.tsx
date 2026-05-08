"use client";

import { useId } from "react";

type AppInputProps = {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  className?: string;
  maxLength?: number;
  autoFocus?: boolean;
};

export function AppInput({
  value,
  defaultValue,
  onChange,
  placeholder,
  type = "text",
  multiline,
  name,
  id,
  required,
  autoComplete,
  disabled,
  readOnly,
  error,
  className = "",
  maxLength,
  autoFocus,
}: AppInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const baseClass = ["app-input", error ? "app-input--error" : "", className].filter(Boolean).join(" ");

  if (multiline) {
    return (
      <textarea
        name={name}
        id={inputId}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={baseClass}
        style={{ resize: "vertical", minHeight: 80 }}
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <input
      type={type}
      name={name}
      id={inputId}
      required={required}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      disabled={disabled}
      readOnly={readOnly}
      className={baseClass}
      maxLength={maxLength}
      autoFocus={autoFocus}
    />
  );
}
