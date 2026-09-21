"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { useAppUi } from "@/components/AppUiProvider";
import { interpolate } from "@/lib/app-ui";
import type { RsvpAttendee } from "@/lib/rsvp-duplicate";

const GOLD = "#C5922A";
const PURPLE = "#5B2D8E";
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";
const FM = "'JetBrains Mono', ui-monospace, monospace";

const GLASS_LIGHT: React.CSSProperties = {
  background:
    "linear-gradient(155deg, rgba(139,79,216,0.16) 0%, rgba(197,146,42,0.1) 55%, transparent 100%), rgba(255,255,255,0.72)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.82)",
  boxShadow: "0 16px 48px -12px rgba(40,25,15,0.2), inset 0 1px 0 rgba(255,255,255,0.75)",
};

const GLASS_DARK: React.CSSProperties = {
  background:
    "linear-gradient(155deg, rgba(139,79,216,0.28) 0%, rgba(197,146,42,0.16) 55%, transparent 100%), rgba(255,255,255,0.06)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 16px 48px -12px rgba(0,0,0,0.5)",
};

type RsvpRow = {
  id: string;
  status: "confirmed" | "declined";
  submitter_name: string;
  contact: string | null;
  attendees: RsvpAttendee[];
  possible_duplicate_of: string | null;
  duplicate_status: "flagged" | "dismissed" | "merged" | null;
  created_at: string;
  updated_at: string;
};

type RsvpManagerProps = Readonly<{
  eventId: string;
  publicOrigin: string;
}>;

function getRsvpUrl(publicOrigin: string, code: string): string {
  return `${publicOrigin.replace(/\/$/, "")}/rsvp/${encodeURIComponent(code)}`;
}

export function RsvpManager({ eventId, publicOrigin }: RsvpManagerProps) {
  const ui = useAppUi();
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpCode, setRsvpCode] = useState<string | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(true);
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRsvpCode(data.rsvpCode ?? null);
      setRsvpOpen(Boolean(data.rsvpOpen));
      setRows(Array.isArray(data.rsvps) ? data.rsvps : []);
    } catch {
      setError(ui.rsvpTab.loadFail);
    } finally {
      setLoading(false);
    }
  }, [eventId, ui.rsvpTab.loadFail]);

  useEffect(() => {
    void load();
  }, [load]);

  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const stats = useMemo(() => {
    let confirmedParties = 0;
    let declinedParties = 0;
    let attendees = 0;
    let flaggedDuplicates = 0;
    for (const row of rows) {
      if (row.status === "confirmed") {
        confirmedParties += 1;
        attendees += row.attendees?.length ?? 0;
      } else {
        declinedParties += 1;
      }
      if (row.duplicate_status === "flagged") flaggedDuplicates += 1;
    }
    return { confirmedParties, declinedParties, attendees, flaggedDuplicates };
  }, [rows]);

  async function copyLink() {
    if (!rsvpCode) return;
    try {
      await navigator.clipboard.writeText(getRsvpUrl(publicOrigin, rsvpCode));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can fail silently (permissions); the link is still shown on screen to copy manually.
    }
  }

  async function shareLink() {
    if (!rsvpCode) return;
    const url = getRsvpUrl(publicOrigin, rsvpCode);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // Fall through to clipboard.
      }
    }
    void copyLink();
  }

  async function toggleOpen() {
    setToggleBusy(true);
    setError(null);
    const next = !rsvpOpen;
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_open", open: next }),
      });
      if (!res.ok) throw new Error();
      setRsvpOpen(next);
    } catch {
      setError(ui.rsvpTab.actionFail);
    } finally {
      setToggleBusy(false);
    }
  }

  async function regenerateCode() {
    if (!window.confirm(ui.rsvpTab.regenerateConfirm)) return;
    setRegenBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "regenerate_code" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRsvpCode(data.rsvpCode ?? null);
    } catch {
      setError(ui.rsvpTab.actionFail);
    } finally {
      setRegenBusy(false);
    }
  }

  async function handleDuplicateAction(rowId: string, action: "dismiss" | "merge") {
    setBusyId(rowId);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      await load();
    } catch {
      setError(ui.rsvpTab.actionFail);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(rowId: string) {
    if (!window.confirm(ui.rsvpTab.deleteConfirm)) return;
    setBusyId(rowId);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/rsvp/${rowId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    } catch {
      setError(ui.rsvpTab.actionFail);
    } finally {
      setBusyId(null);
    }
  }

  const textColor = isDark ? "rgba(255,255,255,0.9)" : "var(--app-text)";
  const mutedColor = isDark ? "rgba(255,255,255,0.45)" : "var(--app-muted)";
  const borderColor = isDark ? "rgba(255,255,255,0.14)" : "var(--app-border)";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.88)";
  const dangerColor = isDark ? "#fca5a5" : "var(--app-danger)";
  const glass = isDark ? GLASS_DARK : GLASS_LIGHT;

  if (loading) {
    return <div style={{ padding: "40px 0", textAlign: "center", color: mutedColor }}>{ui.rsvpPublic.loading}</div>;
  }

  const rsvpUrl = rsvpCode ? getRsvpUrl(publicOrigin, rsvpCode) : null;

  return (
    <section className="welcome-reveal" style={{ display: "flex", flexDirection: "column", gap: 16, padding: "2px 0 32px" }}>
      <div>
        <p style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: textColor }}>
          {ui.rsvpTab.title}
        </p>
        <p style={{ margin: "4px 0 0", fontFamily: FB, fontSize: 13, color: mutedColor }}>{ui.rsvpTab.subtitle}</p>
      </div>

      {error && (
        <p
          style={{
            fontSize: 13,
            color: dangerColor,
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 30%, transparent)",
            padding: "10px 14px",
            borderRadius: 10,
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {/* ── Link card ── */}
      <div style={{ ...glass, borderRadius: 20, padding: "20px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedColor }}>
            {ui.rsvpTab.linkLabel}
          </span>
          <button
            type="button"
            onClick={() => void toggleOpen()}
            disabled={toggleBusy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 100,
              border: `1px solid ${rsvpOpen ? GOLD : borderColor}`,
              background: rsvpOpen ? "rgba(197,146,42,0.12)" : "transparent",
              color: rsvpOpen ? GOLD : mutedColor,
              fontFamily: FB,
              fontSize: 11,
              fontWeight: 700,
              cursor: toggleBusy ? "wait" : "pointer",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: rsvpOpen ? GOLD : mutedColor }} />
            {rsvpOpen ? ui.rsvpTab.openToggleOn : ui.rsvpTab.openToggleOff}
          </button>
        </div>

        {rsvpUrl && (
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 8, boxShadow: "0 8px 24px rgba(40,25,15,0.15)" }}>
              <QRCode value={rsvpUrl} size={96} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div
                style={{
                  fontFamily: FM,
                  fontSize: 13,
                  color: textColor,
                  background: inputBg,
                  border: "1px dashed rgba(197,146,42,0.4)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  wordBreak: "break-all",
                  marginBottom: 10,
                }}
              >
                {rsvpUrl}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1px solid ${copied ? GOLD : borderColor}`,
                    background: copied ? "rgba(197,146,42,0.12)" : inputBg,
                    color: copied ? GOLD : textColor,
                    fontFamily: FB,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {copied ? ui.common.copied : ui.rsvpTab.copyLink}
                </button>
                <button
                  type="button"
                  onClick={() => void shareLink()}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: "none",
                    background: `linear-gradient(135deg, #7B3FBE, ${PURPLE})`,
                    color: "#fff",
                    fontFamily: FB,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {ui.rsvpTab.shareLink}
                </button>
                <button
                  type="button"
                  onClick={() => void regenerateCode()}
                  disabled={regenBusy}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 10,
                    border: `1px solid ${borderColor}`,
                    background: "transparent",
                    color: mutedColor,
                    fontFamily: FB,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: regenBusy ? "wait" : "pointer",
                  }}
                >
                  {ui.rsvpTab.regenerateCode}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { label: ui.rsvpTab.statConfirmed, value: stats.confirmedParties },
          { label: ui.rsvpTab.statDeclined, value: stats.declinedParties },
          { label: ui.rsvpTab.statAttendees, value: stats.attendees },
          { label: ui.rsvpTab.statPending, value: stats.flaggedDuplicates },
        ].map((stat) => (
          <div key={stat.label} style={{ ...glass, borderRadius: 14, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: GOLD, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontFamily: FB, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedColor, marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Responses list ── */}
      {rows.length === 0 ? (
        <p style={{ textAlign: "center", color: mutedColor, fontFamily: FB, fontSize: 13, padding: "20px 0" }}>
          {ui.rsvpTab.emptyState}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => {
            const duplicateTarget = row.possible_duplicate_of ? rowById.get(row.possible_duplicate_of) : undefined;
            const isFlagged = row.duplicate_status === "flagged";
            const adults = row.attendees?.filter((a) => a.type === "adult").length ?? 0;
            const children = row.attendees?.filter((a) => a.type === "child").length ?? 0;
            const dateLabel = interpolate(row.updated_at !== row.created_at ? ui.rsvpTab.listUpdatedOn : ui.rsvpTab.listSubmittedOn, {
              date: new Date(row.created_at).toLocaleDateString(),
            });

            return (
              <div key={row.id} style={{ ...glass, borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <span style={{ fontFamily: FB, fontSize: 14, fontWeight: 700, color: textColor }}>{row.submitter_name}</span>
                    <span
                      style={{
                        marginLeft: 8,
                        fontFamily: FB,
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 100,
                        color: row.status === "confirmed" ? "#4E7C3A" : dangerColor,
                        background: row.status === "confirmed" ? "rgba(78,124,58,0.12)" : "color-mix(in srgb, var(--app-danger) 10%, transparent)",
                      }}
                    >
                      {row.status === "confirmed" ? ui.rsvpTab.listStatusConfirmed : ui.rsvpTab.listStatusDeclined}
                    </span>
                    <p style={{ margin: "4px 0 0", fontFamily: FB, fontSize: 11, color: mutedColor }}>{dateLabel}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleDelete(row.id)}
                    disabled={busyId === row.id}
                    style={{ background: "none", border: "none", color: mutedColor, fontFamily: FB, fontSize: 11, cursor: "pointer" }}
                  >
                    {ui.rsvpTab.deleteEntry}
                  </button>
                </div>

                {row.status === "confirmed" && row.attendees?.length > 0 && (
                  <div style={{ marginTop: 8, fontFamily: FB, fontSize: 12, color: textColor }}>
                    {row.attendees.map((a) => a.name).join(", ")}
                    <span style={{ color: mutedColor }}>
                      {" · "}
                      {interpolate(ui.rsvpTab.listAdults, { count: adults })}
                      {children > 0 ? `, ${interpolate(ui.rsvpTab.listChildren, { count: children })}` : ""}
                    </span>
                  </div>
                )}

                {row.contact && (
                  <p style={{ margin: "6px 0 0", fontFamily: FB, fontSize: 12, color: mutedColor }}>
                    {ui.rsvpTab.listContact}: {row.contact}
                  </p>
                )}

                {isFlagged && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(197,146,42,0.1)",
                      border: "1px solid rgba(197,146,42,0.3)",
                    }}
                  >
                    <p style={{ margin: "0 0 6px", fontFamily: FB, fontSize: 11.5, fontWeight: 700, color: GOLD }}>
                      {ui.rsvpTab.duplicateBadge}
                      {duplicateTarget ? ` · ${interpolate(ui.rsvpTab.duplicateOf, { name: duplicateTarget.submitter_name })}` : ""}
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => void handleDuplicateAction(row.id, "merge")}
                        disabled={busyId === row.id}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: GOLD,
                          color: "#fff",
                          fontFamily: FB,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: busyId === row.id ? "wait" : "pointer",
                        }}
                      >
                        {ui.rsvpTab.duplicateMerge}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDuplicateAction(row.id, "dismiss")}
                        disabled={busyId === row.id}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 8,
                          border: "1px solid rgba(197,146,42,0.4)",
                          background: "transparent",
                          color: GOLD,
                          fontFamily: FB,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: busyId === row.id ? "wait" : "pointer",
                        }}
                      >
                        {ui.rsvpTab.duplicateDismiss}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
