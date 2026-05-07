"use client";

import { normalizeAccessCode } from "@/lib/access-code";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (normalized.length < 4) {
      setError("Enter the code from your invite (at least 4 characters).");
      return;
    }
    setError(null);
    router.push(`/join/${encodeURIComponent(normalized)}`);
  }

  return (
    <div style={{ padding: '40px 0 60px', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 24 }} />
      <span style={{ fontSize: 64, marginBottom: 8 }}>🔑</span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', marginBottom: 6 }}>
        Join Event
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 36, lineHeight: 1.6, maxWidth: 320 }}>
        Enter the access code shared by your event organizer.
      </p>

      <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 36, width: '100%' }}>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 8 }}>
            <label htmlFor="access-code" style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 12 }}>
              Access Code
            </label>
            <input
              id="access-code"
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="CALISTO-XXXXXX"
              style={{
                width: '100%', padding: '18px 20px',
                background: 'var(--app-bg)',
                border: `2px solid ${code.length > 5 ? 'var(--app-gold)' : 'var(--app-border)'}`,
                borderRadius: 14, fontSize: 22, fontWeight: 700,
                color: 'var(--app-text)', outline: 'none', textAlign: 'center',
                letterSpacing: '0.12em', transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
            />
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--app-muted)', marginTop: 10, lineHeight: 1.5 }}>
              Hint: codes look like <strong style={{ fontStyle: 'normal' }}>CALISTO-S2UAQ4</strong>
            </p>
          </div>
          {error && (
            <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%', marginTop: 24, padding: '15px', border: 'none', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Join Event →
          </button>
        </form>
      </div>
    </div>
  );
}
