type StatRingProps = {
  value: number;
  max: number;
  color: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
};

export function StatRing({ value, max, color, label, sublabel, icon }: StatRingProps) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, minWidth: 80 }}>
      <div style={{ position: 'relative', width: 76, height: 76 }}>
        <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="38" cy="38" r={r} fill="none" stroke="var(--app-border)" strokeWidth="5.5" />
          <circle
            cx="38" cy="38" r={r} fill="none"
            stroke={color} strokeWidth="5.5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--app-muted)', marginTop: 3 }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, fontWeight: 600, color, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}
