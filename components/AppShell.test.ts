import { describe, it, expect } from 'vitest';

function getActiveNav(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/') return 'home';
  if (pathname.startsWith('/events/new')) return 'create';
  if (pathname.startsWith('/events')) return 'events';
  if (pathname.startsWith('/join')) return 'join';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

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
