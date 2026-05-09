"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { applyCalistoTheme, type CalistoTheme, readCalistoTheme } from "@/lib/calisto-theme";

const HELP_MAIL = "mailto:info@calisto-events.com?subject=Calisto%20help";

type AppShellAccountMenuProps = Readonly<{
  userName: string;
  userInitial: string;
}>;

export function AppShellAccountMenu({ userName, userInitial }: AppShellAccountMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<CalistoTheme>("dark");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setTheme(readCalistoTheme()));
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      const el = wrapRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onTheme = useCallback((t: CalistoTheme) => {
    setTheme(t);
    applyCalistoTheme(t);
  }, []);

  async function onSignOut() {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.replace("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={wrapRef} className="app-account-menu" style={{ position: "relative", flexShrink: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        className="app-account-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        title={userName}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sr-only">Account menu</span>
        <span aria-hidden style={{ pointerEvents: "none" }}>
          {userInitial}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="app-account-menu__panel"
          style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, zIndex: 250 }}
        >
          <div className="app-account-menu__section" style={{ padding: "10px 14px 8px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--app-muted)",
              }}
            >
              Signed in
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--app-text)",
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={userName}
            >
              {userName}
            </p>
          </div>

          <div className="app-account-menu__separator" role="separator" />

          <Link
            role="menuitem"
            href="/settings#profile"
            className="app-account-menu__item"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link role="menuitem" href="/settings" className="app-account-menu__item" onClick={() => setOpen(false)}>
            Settings
          </Link>
          <a role="menuitem" href={HELP_MAIL} className="app-account-menu__item" onClick={() => setOpen(false)}>
            Help
          </a>

          <div className="app-account-menu__separator" role="separator" />

          <div className="app-account-menu__theme" role="group" aria-label="Theme">
            <span className="app-account-menu__theme-label">Theme</span>
            <div className="app-account-menu__theme-toggle">
              {(["light", "dark"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`app-account-menu__theme-btn${theme === t ? " app-account-menu__theme-btn--active" : ""}`}
                  aria-pressed={theme === t}
                  onClick={() => onTheme(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="app-account-menu__separator" role="separator" />

          <button
            type="button"
            role="menuitem"
            className="app-account-menu__item app-account-menu__item--danger"
            disabled={signingOut}
            onClick={() => void onSignOut()}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
