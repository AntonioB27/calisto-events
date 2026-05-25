"use client";

import { GoldBar } from "@/components/app-ui/GoldBar";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { useAppUi } from "@/components/AppUiProvider";
import { interpolate } from "@/lib/app-ui/interpolate";
import { DEMO_GUESTS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";

export function DemoGuestsTab() {
  const { triggerDemoToast } = useDemoToast();
  const ui = useAppUi();

  return (
    <section>
      <div
        className="welcome-reveal"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <GoldBar vertical />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 20,
                color: "var(--app-text)",
              }}
            >
              {ui.guests.title}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--app-muted)", margin: 0 }}>
            {DEMO_GUESTS.length === 1
              ? ui.guests.membersOne
              : interpolate(ui.guests.membersMany, { n: DEMO_GUESTS.length })}
          </p>
        </div>
        <AppBtn variant="ghost" small onClick={triggerDemoToast}>
          {ui.common.refresh}
        </AppBtn>
      </div>

      <ul style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, padding: 0, listStyle: "none" }}>
        {DEMO_GUESTS.map((guest, idx) => {
          const isPrimary = guest.role === "organizer";
          const isOrgRole = guest.role === "organizer" || guest.role === "co_organizer";

          const avatarColor = isPrimary
            ? "var(--app-gold)"
            : guest.role === "co_organizer"
              ? "var(--app-purple)"
              : "var(--app-muted)";

          const avatarBg = isPrimary
            ? "linear-gradient(135deg, color-mix(in srgb, var(--app-gold) 22%, transparent), color-mix(in srgb, var(--app-gold) 10%, transparent))"
            : guest.role === "co_organizer"
              ? "linear-gradient(135deg, color-mix(in srgb, var(--app-purple) 22%, transparent), color-mix(in srgb, var(--app-purple) 10%, transparent))"
              : "color-mix(in srgb, var(--app-muted) 10%, transparent)";

          const roleBadge =
            guest.role === "organizer"
              ? ui.dashboard.roleOrganizer
              : guest.role === "co_organizer"
                ? ui.dashboard.roleCoOrganizer
                : ui.guests.guestLabelFallback;

          const avatarLetter = guest.name.trim()[0]?.toUpperCase() ?? "?";

          return (
            <li
              key={guest.id}
              className="welcome-reveal guest-member-row"
              style={{
                animationDelay: `${0.05 + idx * 0.04}s`,
                background: "var(--app-card)",
                borderRadius: 16,
                border: "1.5px solid var(--app-border)",
                padding: "14px 18px",
                fontSize: 14,
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: avatarBg,
                    border: `1.5px solid color-mix(in srgb, ${avatarColor} 30%, var(--app-border))`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 16,
                    color: avatarColor,
                  }}
                >
                  {avatarLetter}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 700,
                        color: "var(--app-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        margin: 0,
                      }}
                    >
                      {guest.name}
                    </p>
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: isOrgRole
                          ? "color-mix(in srgb, var(--app-gold) 12%, transparent)"
                          : "color-mix(in srgb, var(--app-muted) 12%, transparent)",
                        border: isOrgRole
                          ? "1.5px solid color-mix(in srgb, var(--app-gold) 30%, transparent)"
                          : "1.5px solid var(--app-border)",
                        color: isOrgRole ? "var(--app-gold)" : "var(--app-muted)",
                      }}
                    >
                      {roleBadge}
                    </span>
                  </div>
                  <p style={{ marginTop: 4, fontSize: 11, color: "var(--app-muted)", margin: "4px 0 0" }}>
                    {interpolate(ui.guests.uploadsLine, { photos: guest.photoCount, videos: guest.videoCount })}
                  </p>
                </div>
              </div>

              {!isPrimary ? (
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid var(--app-border)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <AppBtn variant="ghost" small onClick={triggerDemoToast}>
                    {guest.role === "guest" ? ui.guests.promoteCo : ui.guests.demoteGuest}
                  </AppBtn>
                  <AppBtn variant="danger" size="sm" type="button" onClick={triggerDemoToast}>
                    {ui.common.remove}
                  </AppBtn>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
