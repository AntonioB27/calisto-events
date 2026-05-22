"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";
import { DEMO_GUESTS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const MUTED  = 'var(--app-muted)';

function roleLabel(role: string): string {
  if (role === "organizer") return "Organizer";
  if (role === "co_organizer") return "Co-organizer";
  return "Guest";
}

function roleColor(role: string): string {
  if (role === "organizer") return GOLD;
  if (role === "co_organizer") return PURPLE;
  return MUTED;
}

export function DemoGuestsTab() {
  const { triggerDemoToast } = useDemoToast();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="welcome-reveal">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <GoldBar vertical />
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 20, color: "var(--app-text)" }}>
            Guests
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          {DEMO_GUESTS.length} people joined this event.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DEMO_GUESTS.map((guest) => (
          <div
            key={guest.id}
            style={{
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              borderRadius: 14,
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Avatar circle */}
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColor(guest.role)}44, ${roleColor(guest.role)}22)`, border: `2px solid ${roleColor(guest.role)}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 15, color: roleColor(guest.role) }}>
              {guest.name[0]}
            </div>

            {/* Name + role */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FB, fontWeight: 600, fontSize: 14, color: "var(--app-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {guest.name}
              </div>
              <div style={{ fontSize: 11, color: roleColor(guest.role), fontFamily: FB, fontWeight: 600, marginTop: 1 }}>
                {roleLabel(guest.role)}
              </div>
            </div>

            {/* Photo count */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: GOLD, lineHeight: 1 }}>
                {guest.photoCount}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED, fontFamily: FB, marginTop: 1 }}>
                photos
              </div>
            </div>

            {/* Remove button */}
            {guest.role !== "organizer" && (
              <button
                type="button"
                onClick={triggerDemoToast}
                style={{ background: "transparent", border: "1px solid var(--app-border)", color: MUTED, padding: "5px 10px", borderRadius: 8, fontFamily: FB, fontSize: 11, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
