"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  userName: string;
  userInitial: string;
  children: React.ReactNode;
};

function getActiveNav(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/') return 'home';
  if (pathname.startsWith('/events/new')) return 'create';
  if (pathname.startsWith('/events')) return 'events';
  if (pathname.startsWith('/join')) return 'join';
  if (pathname.startsWith('/settings')) return 'settings';
  return null;
}

const NAV_LINKS = [
  { id: 'home',     href: '/dashboard', label: 'Home' },
  { id: 'events',   href: '/events',    label: 'Events' },
  { id: 'settings', href: '/settings',  label: 'Settings' },
];

const DOCK_ITEMS = [
  { id: 'home',   href: '/dashboard',  label: 'Home',   icon: '⌂' },
  { id: 'events', href: '/events',     label: 'Events', icon: '◈' },
  { id: 'create', href: '/events/new', label: 'New',    icon: '+' },
  { id: 'join',   href: '/join',       label: 'Join',   icon: '⬡' },
];

export function AppShell({ userName, userInitial, children }: AppShellProps) {
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  // Detect event sub-screen (not /events/new)
  const eventMatch = pathname.match(/^\/events\/([^\/]+)/);
  const isEventScreen = Boolean(eventMatch && eventMatch[1] !== 'new');

  return (
    <div
      className="app-shell"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* ── Top bar ─────────────────────────────────── */}
      <header style={{
        height: 64, flexShrink: 0,
        background: 'var(--app-card)',
        borderBottom: '1px solid var(--app-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: 0,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Wordmark */}
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginRight: 40, textDecoration: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic', fontWeight: 700,
            fontSize: 26, color: 'var(--app-text)',
            letterSpacing: '-0.02em',
          }}>
            Calisto
          </span>
          <div style={{ width: 6, height: 6, background: 'var(--app-gold)', borderRadius: '50%', marginBottom: 8 }} />
        </Link>

        {/* Nav links — hidden on mobile */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }} className="hidden md:flex">
          {NAV_LINKS.map(link => {
            const on = active === link.id;
            return (
              <Link key={link.id} href={link.href} style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: on ? `color-mix(in srgb, var(--app-purple) 12%, transparent)` : 'transparent',
                color: on ? 'var(--app-purple)' : 'var(--app-muted)',
                fontSize: 14, fontWeight: on ? 600 : 400,
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.15s',
              }}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginLeft: 'auto' }}>
          <Link href="/join" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'transparent', color: 'var(--app-gold)',
            border: '1.5px solid var(--app-gold)', textDecoration: 'none',
            transition: 'all 0.18s',
          }}>
            Join
          </Link>
          <Link href="/events/new" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none', border: 'none',
            transition: 'all 0.18s',
          }}>
            + New Event
          </Link>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--app-purple), #7B3FBE)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}
          title={userName}
          >
            {userInitial}
          </div>
        </div>
      </header>

      {/* ── Event sub-bar ─────────────────────────────── */}
      {isEventScreen && (
        <div style={{
          height: 44, flexShrink: 0,
          background: 'var(--app-bg)',
          borderBottom: '1px solid var(--app-border)',
          display: 'flex', alignItems: 'center',
          padding: '0 32px', gap: 0,
        }}>
          <Link href="/dashboard" style={{
            fontSize: 13, color: 'var(--app-muted)', textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            ← Home
          </Link>
          <span style={{ color: 'var(--app-border)', margin: '0 10px' }}>/</span>
          <span style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 14, color: 'var(--app-text)',
          }}>
            Event
          </span>
        </div>
      )}

      {/* ── Scrollable content ─────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 32px 80px' }}>
          {children}
        </div>
      </main>

      {/* ── Mobile dock — hidden above md ─────────────── */}
      <div
        className="md:hidden"
        style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}
      >
        <div style={{
          background: 'rgba(34, 21, 9, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: 40, padding: '10px 14px',
          display: 'flex', gap: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}>
          {DOCK_ITEMS.map(item => {
            const on = active === item.id;
            return (
              <Link key={item.id} href={item.href} style={{
                width: 46, height: 46,
                background: on ? 'linear-gradient(135deg, var(--app-gold), #D4A843)' : 'transparent',
                borderRadius: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                color: on ? '#fff' : 'rgba(255,255,255,0.45)',
                fontSize: 18, fontWeight: 700,
                transition: 'all 0.2s',
              }}>
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
