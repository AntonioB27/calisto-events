type GoldBarProps = { vertical?: boolean };

export function GoldBar({ vertical }: GoldBarProps) {
  if (vertical) {
    return (
      <div style={{ width: 3, height: 16, background: 'var(--app-gold)', borderRadius: 2, flexShrink: 0 }} />
    );
  }
  return (
    <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2 }} />
  );
}
