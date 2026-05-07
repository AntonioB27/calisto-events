"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";

type Step1DetailsProps = {
  defaultName: string;
  defaultDate: string;
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 16px',
  background: 'var(--app-bg)',
  border: '1.5px solid var(--app-border)',
  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
  outline: 'none', fontFamily: 'inherit',
};

export function Step1Details({ defaultName, defaultDate }: Step1DetailsProps) {
  return (
    <div style={{ padding: '40px 0 60px' }}>
      <GoldBar />
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)', marginTop: 10, marginBottom: 6 }}>
        Create Event
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 32 }}>
        You&apos;ll automatically become the organizer.
      </p>

      <form action="/events/new" method="get">
        <input type="hidden" name="step" value="2" />

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label htmlFor="name" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--app-muted)', display: 'block', marginBottom: 8 }}>
                Event title
              </label>
              <input
                id="name" name="name" type="text"
                defaultValue={defaultName}
                placeholder="e.g. Kyle & Laura"
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <label htmlFor="date" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--app-muted)', display: 'block', marginBottom: 8 }}>
                Event date
              </label>
              <input
                id="date" name="date" type="date"
                defaultValue={defaultDate}
                style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 24, width: '100%', padding: '15px', border: 'none', borderRadius: 14,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Continue to plan →
        </button>
      </form>
    </div>
  );
}
