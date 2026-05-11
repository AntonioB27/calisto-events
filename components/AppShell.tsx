"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import { AppShellAccountMenu } from "@/components/AppShellAccountMenu";
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

export function AppShell({ userName, userInitial, children }: AppShellProps) {
  const ui = useAppUi();
  const NAV_LINKS = [
    { id: "home", href: "/dashboard", label: ui.shell.navHome },
    { id: "settings", href: "/settings", label: ui.shell.navSettings },
  ];
  const pathname = usePathname();
  const active = getActiveNav(pathname);

  const eventMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventScreen = Boolean(eventMatch && eventMatch[1] !== "new");

  return (
    <div className="app-shell flex h-[100dvh] flex-col overflow-hidden">
      <header
        className="app-shell-header flex h-16 shrink-0 items-center gap-1 px-4 md:gap-2 md:px-7"
        style={{
          borderBottom: "1px solid color-mix(in srgb, var(--app-gold) 18%, var(--app-border))",
          boxShadow: "0 1px 0 color-mix(in srgb, var(--app-gold) 12%, transparent), 0 4px 20px -8px rgba(0,0,0,0.06)",
        }}
      >
        <Link
          href="/dashboard"
          className="mr-4 flex min-w-0 shrink items-center gap-1.5 no-underline md:mr-10"
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

        <nav className="hidden min-w-0 flex-1 gap-0.5 md:flex">
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

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-2.5">
          <AppBtn as={Link} href="/join" variant="outline" size="sm" className="inline-flex shrink-0">
            {ui.shell.joinCta}
          </AppBtn>
          <AppBtn
            as={Link}
            href="/events/new"
            variant="gold"
            size="sm"
            className="shrink-0"
            aria-label={ui.shell.newEventAria}
          >
            <span className="md:hidden">{ui.shell.newEventShort}</span>
            <span className="hidden md:inline">{ui.shell.newEventLabel}</span>
          </AppBtn>
          <AppShellAccountMenu userName={userName} userInitial={userInitial} />
        </div>
      </header>

      {isEventScreen && (
        <div
          className="relative z-10 flex h-11 shrink-0 items-center gap-0 px-4 md:px-7"
          style={{
            background: "color-mix(in srgb, var(--app-surface) 60%, transparent)",
            borderBottom: "1px solid color-mix(in srgb, var(--app-border) 70%, transparent)",
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
            {ui.shell.eventBreadcrumb}
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
            {ui.shell.eventContext}
          </span>
        </div>
      )}

      <main className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto max-w-[1040px] px-4 pb-6 pt-0 md:px-7 md:pb-20">{children}</div>
      </main>
    </div>
  );
}
