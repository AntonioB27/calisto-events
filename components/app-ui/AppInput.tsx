"use client";

import { useState } from "react";

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
};

export function AppInput({
  value, defaultValue, onChange, placeholder,
  type = 'text', multiline, name, id, required, autoComplete,
}: AppInputProps) {
  const [focus, setFocus] = useState(false);

  const shared: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: 'var(--app-bg)',
    border: `1.5px solid ${focus ? 'var(--app-gold)' : 'var(--app-border)'}`,
    borderRadius: 12,
    fontSize: 15,
    color: 'var(--app-text)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const handlers = {
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
  };

  if (multiline) {
    return (
      <textarea
        name={name} id={id} required={required}
        value={value} defaultValue={defaultValue}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{ ...shared, resize: 'vertical', minHeight: 80 }}
        {...handlers}
      />
    );
  }

  return (
    <input
      type={type} name={name} id={id} required={required}
      value={value} defaultValue={defaultValue}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      style={shared}
      {...handlers}
    />
  );
}
