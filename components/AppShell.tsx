"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Calendar, Images, Users, Plus, Camera, QrCode } from "lucide-react";
import { Suspense } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppShellAccountMenu } from "@/components/AppShellAccountMenu";

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

const NAV_ICONS: Record<string, React.ComponentType<{ size: number }>> = {
  home: Home,
  event: Calendar,
  gallery: Images,
  guests: Users,
  prints: Camera,
};

function NavLinks({ eventId }: { eventId: string | null }) {
  const ui = useAppUi();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const active = getActiveNav(pathname);

  const isEventScreen = Boolean(eventId);

  const links = [
    { id: "home", href: "/dashboard", label: ui.shell.navHome },
    ...(isEventScreen && eventId
      ? [
          { id: "event",   href: `/events/${eventId}?tab=overview`, label: ui.shell.navEvent          },
          { id: "gallery", href: `/events/${eventId}?tab=gallery`,  label: ui.shell.navGallery         },
          { id: "guests",  href: `/events/${eventId}?tab=guests`,   label: ui.shell.navGuests          },
          { id: "prints",  href: `/events/${eventId}?tab=prints`,   label: ui.eventNav.tabPrints       },
        ]
      : []),
  ];

  function isActive(linkId: string): boolean {
    if (linkId === "home")    return active === "home";
    if (linkId === "event")   return isEventScreen && (!currentTab || currentTab === "overview");
    if (linkId === "gallery") return isEventScreen && currentTab === "gallery";
    if (linkId === "guests")  return isEventScreen && currentTab === "guests";
    if (linkId === "prints")  return isEventScreen && currentTab === "prints";
    return false;
  }

  return (
    <>
      {links.map((link) => {
        const on = isActive(link.id);
        const Icon = NAV_ICONS[link.id];
        return (
          <Link
            key={link.id}
            href={link.href}
            aria-current={on ? "page" : undefined}
            className={`app-nav-link${on ? " app-nav-link--active" : ""}`}
          >
            {Icon && <Icon size={16} />}
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function AppShellInner({ userName, userInitial, children }: AppShellProps) {
  const ui = useAppUi();
  const pathname = usePathname();

  const eventMatch = pathname.match(/^\/events\/([^/]+)/);
  const isEventScreen = Boolean(eventMatch && eventMatch[1] !== "new");
  const eventId = isEventScreen ? eventMatch![1] : null;

  return (
    <div className="app-shell flex h-[100dvh] flex-col overflow-hidden">
      <header className="app-shell-header relative flex shrink-0 items-center overflow-visible">
        {/* Design 03 top gold sheen line */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--app-gold), transparent)",
            opacity: 0.75,
            pointerEvents: "none",
          }}
        />

        {/* Wordmark */}
        <Link
          href="/dashboard"
          className="flex min-w-0 shrink items-center gap-1.5 no-underline"
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: "-0.02em",
              background: "linear-gradient(105deg, var(--app-text) 30%, var(--app-gold) 130%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Calisto
          </span>
          <span
            style={{
              width: 6,
              height: 6,
              background: "var(--app-gold)",
              borderRadius: "50%",
              marginBottom: 8,
              boxShadow: "0 0 7px color-mix(in srgb, var(--app-gold) 70%, transparent)",
            }}
          />
        </Link>

        {/* Desktop nav links — absolutely centred; hidden on mobile */}
        <nav className="app-shell-nav-center hidden md:flex">
          <Suspense fallback={null}>
            <NavLinks eventId={eventId} />
          </Suspense>
        </nav>

        {/* Right side: Join + New Event + rule + avatar */}
        <div className="ml-auto flex shrink-0 items-center gap-4 md:gap-5">
          <Link href="/join" className="app-shell-text-link app-shell-join-link" aria-label={ui.shell.joinCta}>
            <QrCode size={16} strokeWidth={1.8} />
            <span className="hidden md:inline">{ui.shell.joinCta}</span>
          </Link>
          <Link href="/events/new" className="app-shell-text-link app-shell-new-event-link" aria-label={ui.shell.newEventAria}>
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden md:inline">{ui.shell.newEventLabel}</span>
          </Link>
          <div className="app-shell-rule" aria-hidden />
          <AppShellAccountMenu userName={userName} userInitial={userInitial} />
        </div>
      </header>

      <main className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="mx-auto max-w-[1040px] px-4 pb-24 pt-0 md:px-7 md:pb-8">{children}</div>
      </main>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <Suspense fallback={null}>
      <AppShellInner {...props} />
    </Suspense>
  );
}
