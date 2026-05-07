import { describe, it, expect } from 'vitest';

function ringOffset(value: number, max: number, r = 32): number {
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return circ * (1 - pct);
}

describe('ringOffset', () => {
  it('returns full circumference when value is 0', () => {
    const circ = 2 * Math.PI * 32;
    expect(ringOffset(0, 100)).toBeCloseTo(circ);
  });

  it('returns 0 when value equals max', () => {
    expect(ringOffset(100, 100)).toBeCloseTo(0);
  });

  it('returns half circumference at 50%', () => {
    const circ = 2 * Math.PI * 32;
    expect(ringOffset(50, 100)).toBeCloseTo(circ * 0.5);
  });

  it('clamps value above max to full fill', () => {
    expect(ringOffset(200, 100)).toBeCloseTo(0);
  });
});
