import { describe, it, expect } from 'vitest';
import { getActiveNav } from './AppShell';

describe('getActiveNav', () => {
  it('returns home for /dashboard', () => {
    expect(getActiveNav('/dashboard')).toBe('home');
  });
  it('returns events for /events/abc123', () => {
    expect(getActiveNav('/events/abc123')).toBe('events');
  });
  it('returns create for /events/new', () => {
    expect(getActiveNav('/events/new')).toBe('create');
  });
  it('returns join for /join', () => {
    expect(getActiveNav('/join')).toBe('join');
  });
  it('returns null for unknown paths', () => {
    expect(getActiveNav('/onboarding/organizer')).toBeNull();
  });
});
