"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";

const PURPLE = "#5B2D8E";
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background:
    "linear-gradient(155deg, rgba(139,79,216,0.16) 0%, rgba(197,146,42,0.1) 55%, transparent 100%), rgba(255,255,255,0.72)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.82)",
  boxShadow: "0 16px 48px -12px rgba(40,25,15,0.2), inset 0 1px 0 rgba(255,255,255,0.75)",
};

export function RsvpUpgradePrompt({ eventId }: Readonly<{ eventId: string }>) {
  const ui = useAppUi();

  return (
    <section style={{ padding: "2px 0 32px" }}>
      <div
        style={{
          ...GLASS_LIGHT,
          borderRadius: 24,
          padding: "28px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "#221509" }}>
          {ui.rsvpTab.upgradeTitle}
        </p>
        <p style={{ margin: 0, fontFamily: FB, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.5, maxWidth: 360 }}>
          {ui.rsvpTab.upgradeBody}
        </p>
        <Link
          href={`/events/${eventId}?tab=settings`}
          style={{
            marginTop: 6,
            display: "inline-flex",
            padding: "11px 20px",
            borderRadius: 12,
            background: `linear-gradient(135deg, #7B3FBE, ${PURPLE})`,
            color: "#fff",
            fontFamily: FB,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(91,45,142,0.32)",
          }}
        >
          {ui.rsvpTab.upgradeCta}
        </Link>
      </div>
    </section>
  );
}
