"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppBtn } from "@/components/app-ui/AppBtn";

type AppShellProps = {
  userName: string;
  userInitial: string;
  children: React.ReactNode;
};

export function getActiveNav(pathname: string): string | null {
  if (pathname === "/dashboard" || pathname === "/") return "home";
  if (pathname.startsWith("/events/new")) return "create";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/join")) return "join";
  if (pathname.startsWith("/settings")) return "settings";
  return null;
}

const NAV_LINKS = [
  { id: "home", href: "/dashboard", label: "Home" },
  { id: "settings", href: "/settings", label: "Settings" },
];

const DOCK_ITEMS = [
  { id: "home", href: "/dashboard", label: "Home", icon: "⌂" },
  { id: "create", href: "/events/new", label: "New", icon: "+" },
  { id: "join", href: "/join", label: "Join", icon: "⬡" },
];

export function AppShell({ userName, userInitial, children }: AppShellProps) {
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  const eventMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventScreen = Boolean(eventMatch && eventMatch[1] !== "new");

  return (
    <div className="app-shell" style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <header
        style={{
          height: 64,
          flexShrink: 0,
          background: "color-mix(in srgb, var(--app-surface) 82%, transparent)",
          backdropFilter: "blur(24px) saturate(1.4)",
          WebkitBackdropFilter: "blur(24px) saturate(1.4)",
          borderBottom: "1px solid color-mix(in srgb, var(--app-gold) 18%, var(--app-border))",
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: 0,
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 0 color-mix(in srgb, var(--app-gold) 12%, transparent), 0 4px 20px -8px rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginRight: 40,
            textDecoration: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 24,
              color: "var(--app-text)",
              letterSpacing: "-0.02em",
            }}
          >
            Calisto
          </span>
          <span style={{
            width: 6,
            height: 6,
            background: "var(--app-gold)",
            borderRadius: "50%",
            marginBottom: 8,
            boxShadow: "0 0 7px color-mix(in srgb, var(--app-gold) 70%, transparent)",
          }} />
        </Link>

        <nav style={{ display: "flex", gap: 2, flex: 1 }} className="hidden md:flex">
          {NAV_LINKS.map((link) => {
            const on = active === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={on ? "page" : undefined}
                className={`app-nav-link${on ? " app-nav-link--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: "auto" }}>
          <AppBtn as={Link} href="/join" variant="outline" size="sm">
            Join
          </AppBtn>
          <AppBtn as={Link} href="/events/new" variant="gold" size="sm">
            + New Event
          </AppBtn>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--app-purple), var(--app-purple-2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
              boxShadow: "0 0 0 2px var(--app-surface), 0 0 0 3.5px color-mix(in srgb, var(--app-purple) 35%, transparent)",
            }}
            title={userName}
          >
            {userInitial}
          </div>
        </div>
      </header>

      {isEventScreen && (
        <div
          style={{
            height: 44,
            flexShrink: 0,
            background: "color-mix(in srgb, var(--app-surface) 60%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid color-mix(in srgb, var(--app-border) 70%, transparent)",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 0,
          }}
        >
          <Link
            href="/dashboard"
            style={{
              fontSize: 13,
              color: "var(--app-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ← Home
          </Link>
          <span style={{ color: "var(--app-border-strong)", margin: "0 10px" }}>/</span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 14,
              color: "var(--app-text)",
            }}
          >
            Event
          </span>
        </div>
      )}

      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 28px 80px" }}>{children}</div>
      </main>

      <div
        className="md:hidden"
        style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 200 }}
      >
        <div
          style={{
            background: "color-mix(in srgb, var(--app-surface) 85%, transparent)",
            backdropFilter: "blur(28px) saturate(1.3)",
            WebkitBackdropFilter: "blur(28px) saturate(1.3)",
            borderRadius: 40,
            padding: "10px 12px",
            display: "flex",
            gap: 4,
            boxShadow: "var(--app-shadow-lg), 0 0 0 1px color-mix(in srgb, var(--app-gold) 18%, var(--app-border))",
            border: "1px solid color-mix(in srgb, var(--app-gold) 14%, var(--app-border))",
          }}
        >
          {DOCK_ITEMS.map((item) => {
            const on = active === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 700,
                  transition: "all 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                  background: on
                    ? "linear-gradient(135deg, var(--app-gold-2), var(--app-gold))"
                    : "transparent",
                  color: on ? "#1b1208" : "var(--app-muted)",
                  border: on ? "1px solid transparent" : "1px solid transparent",
                  boxShadow: on
                    ? "0 2px 8px color-mix(in srgb, var(--app-gold) 40%, transparent)"
                    : "none",
                  transform: on ? "scale(1.06)" : "scale(1)",
                }}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
