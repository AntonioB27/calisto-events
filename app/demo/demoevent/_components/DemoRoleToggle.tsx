"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { DemoRole, DemoTabId } from "../demo-role";

type Props = {
  currentRole: DemoRole;
  currentTab: DemoTabId;
};

export function DemoRoleToggle({ currentRole, currentTab }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchRole(role: DemoRole) {
    startTransition(() => {
      router.push(`/demo/demoevent?role=${role}&tab=${currentTab}`);
    });
  }

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "10px 16px",
        background: "var(--app-bg)",
        borderBottom: "1px solid var(--app-border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: isPending ? 0.75 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 12px 6px 9px",
          borderRadius: 9,
          background: "rgba(255,255,255,0.55)",
          border: "1px solid var(--app-border)",
          color: "#5B2D8E",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          flexShrink: 0,
        }}
      >
        Home
      </Link>
      <span style={{ flex: 1 }} />
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--app-muted)",
          fontFamily: "'DM Sans', sans-serif",
          flexShrink: 0,
        }}
      >
        Viewing as:
      </span>
      <div
        role="radiogroup"
        aria-label="View as role"
        style={{
          display: "flex",
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          borderRadius: 10,
          padding: 3,
          gap: 3,
        }}
      >
        {(["organizer", "guest"] as DemoRole[]).map((role) => {
          const active = currentRole === role;
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={active ? undefined : () => switchRole(role)}
              tabIndex={active ? -1 : 0}
              style={{
                padding: "6px 18px",
                borderRadius: 7,
                border: "none",
                cursor: active ? "default" : "pointer",
                background: active ? "#C5922A" : "transparent",
                color: active ? "#fff" : "var(--app-muted)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                transition: "background 0.15s, color 0.15s",
                textTransform: "capitalize",
              }}
            >
              {role}
            </button>
          );
        })}
      </div>
    </div>
  );
}
