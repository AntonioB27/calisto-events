"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { interpolate } from "@/lib/app-ui";

const GOLD = "#C5922A";
const PURPLE = "#5B2D8E";
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLASS_LIGHT: React.CSSProperties = {
  background:
    "linear-gradient(155deg, rgba(139,79,216,0.16) 0%, rgba(197,146,42,0.1) 55%, transparent 100%), rgba(255,255,255,0.78)",
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

type Attendee = { name: string; type: "adult" | "child" };

function clientTokenKey(eventId: string): string {
  return `calisto_rsvp_${eventId}`;
}

function getOrCreateClientToken(eventId: string): string {
  const key = clientTokenKey(eventId);
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem(key, created);
    return created;
  } catch {
    // Storage may be unavailable (private mode) — fall back to a session-only token.
    return crypto.randomUUID();
  }
}

export function RsvpForm({ code, eventId, eventTitle }: Readonly<{ code: string; eventId: string; eventTitle: string }>) {
  const ui = useAppUi();
  const [isDark, setIsDark] = useState(false);
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [loadingMine, setLoadingMine] = useState(true);
  const [status, setStatus] = useState<"confirmed" | "declined">("confirmed");
  const [submitterName, setSubmitterName] = useState("");
  const [contact, setContact] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([{ name: "", type: "adult" }]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const token = getOrCreateClientToken(eventId);
    setClientToken(token);
  }, [eventId]);

  useEffect(() => {
    if (!clientToken) return;
    (async () => {
      try {
        const res = await fetch(`/api/rsvp/${code}/mine?clientToken=${encodeURIComponent(clientToken)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.rsvp) {
            setStatus(data.rsvp.status);
            setSubmitterName(data.rsvp.submitter_name ?? "");
            setContact(data.rsvp.contact ?? "");
            if (Array.isArray(data.rsvp.attendees) && data.rsvp.attendees.length > 0) {
              setAttendees(data.rsvp.attendees);
            }
            setSubmitted(true);
            setEditing(false);
          }
        }
      } finally {
        setLoadingMine(false);
      }
    })();
  }, [clientToken, code]);

  const canAddAttendee = attendees.length < 30;

  const updateAttendee = useCallback((index: number, patch: Partial<Attendee>) => {
    setAttendees((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }, []);

  const addAttendee = useCallback(() => {
    setAttendees((prev) => [...prev, { name: "", type: "adult" }]);
  }, []);

  const removeAttendee = useCallback((index: number) => {
    setAttendees((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const heading = useMemo(() => interpolate(ui.rsvpPublic.heading, { event: eventTitle }), [ui.rsvpPublic.heading, eventTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!submitterName.trim()) {
      setError(ui.rsvpPublic.errorRequired);
      return;
    }
    const cleanedAttendees = attendees.map((a) => ({ ...a, name: a.name.trim() })).filter((a) => a.name.length > 0);
    if (status === "confirmed" && cleanedAttendees.length === 0) {
      setError(ui.rsvpPublic.errorAttendeeRequired);
      return;
    }
    if (!clientToken) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${code}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientToken,
          status,
          submitterName: submitterName.trim(),
          contact: contact.trim() || undefined,
          attendees: status === "confirmed" ? cleanedAttendees : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      setEditing(false);
    } catch {
      setError(ui.rsvpPublic.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  const textColor = isDark ? "rgba(255,255,255,0.9)" : "#221509";
  const mutedColor = isDark ? "rgba(255,255,255,0.55)" : "#9a8570";
  const borderColor = isDark ? "rgba(255,255,255,0.14)" : "#ddd4c5";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)";
  const dangerColor = isDark ? "#fca5a5" : "#b42318";

  if (loadingMine) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "64px 20px", textAlign: "center", color: mutedColor }}>
        {ui.rsvpPublic.loading}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 20px 64px" }}>
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 24, padding: "28px 24px" }}>
        <h1 style={{ margin: "0 0 8px", fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 24, color: textColor }}>
          {heading}
        </h1>
        <p style={{ margin: "0 0 22px", fontFamily: FB, fontSize: 13, color: mutedColor, lineHeight: 1.5 }}>
          {ui.rsvpPublic.subheading}
        </p>

        {submitted && !editing ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <p style={{ margin: "0 0 6px", fontFamily: FB, fontSize: 15, fontWeight: 700, color: "#4E7C3A" }}>{ui.rsvpPublic.submitted}</p>
            <p style={{ margin: "0 0 18px", fontFamily: FB, fontSize: 13, color: mutedColor }}>{ui.rsvpPublic.submittedEdit}</p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                padding: "10px 18px",
                borderRadius: 12,
                border: `1px solid ${GOLD}`,
                background: "transparent",
                color: GOLD,
                fontFamily: FB,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {ui.rsvpPublic.editCta}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => setStatus("confirmed")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: status === "confirmed" ? "none" : `1px solid ${borderColor}`,
                  background: status === "confirmed" ? `linear-gradient(135deg, #7B3FBE, ${PURPLE})` : (isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)"),
                  color: status === "confirmed" ? "#fff" : textColor,
                  fontFamily: FB,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {ui.rsvpPublic.yes}
              </button>
              <button
                type="button"
                onClick={() => setStatus("declined")}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: status === "declined" ? "none" : `1px solid ${borderColor}`,
                  background: status === "declined" ? (isDark ? "rgba(255,255,255,0.85)" : "#221509") : (isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.6)"),
                  color: status === "declined" ? (isDark ? "#221509" : "#fff") : textColor,
                  fontFamily: FB,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {ui.rsvpPublic.no}
              </button>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 700, color: mutedColor }}>{ui.rsvpPublic.submitterNameLabel}</span>
              <input
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder={ui.rsvpPublic.submitterNamePlaceholder}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  fontFamily: FB,
                  fontSize: 14,
                  color: textColor,
                  background: inputBg,
                }}
              />
            </label>

            {status === "confirmed" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 700, color: mutedColor }}>{ui.rsvpPublic.attendeesLabel}</span>
                {attendees.map((attendee, index) => (
                  <div key={index} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      value={attendee.name}
                      onChange={(e) => updateAttendee(index, { name: e.target.value })}
                      placeholder={ui.rsvpPublic.attendeeNamePlaceholder}
                      style={{
                        flex: 1,
                        padding: "9px 10px",
                        borderRadius: 10,
                        border: `1px solid ${borderColor}`,
                        fontFamily: FB,
                        fontSize: 13,
                        color: textColor,
                        background: inputBg,
                      }}
                    />
                    <select
                      value={attendee.type}
                      onChange={(e) => updateAttendee(index, { type: e.target.value === "child" ? "child" : "adult" })}
                      style={{
                        padding: "9px 8px",
                        borderRadius: 10,
                        border: `1px solid ${borderColor}`,
                        fontFamily: FB,
                        fontSize: 12.5,
                        color: textColor,
                        background: inputBg,
                      }}
                    >
                      <option value="adult">{ui.rsvpPublic.attendeeAdult}</option>
                      <option value="child">{ui.rsvpPublic.attendeeChild}</option>
                    </select>
                    {attendees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        aria-label={ui.rsvpPublic.removeAttendee}
                        style={{ background: "none", border: "none", color: mutedColor, cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {canAddAttendee && (
                  <button
                    type="button"
                    onClick={addAttendee}
                    style={{ alignSelf: "flex-start", background: "none", border: "none", color: GOLD, fontFamily: FB, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}
                  >
                    + {ui.rsvpPublic.addAttendee}
                  </button>
                )}
              </div>
            )}

            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: FB, fontSize: 12, fontWeight: 700, color: mutedColor }}>{ui.rsvpPublic.contactLabel}</span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={ui.rsvpPublic.contactPlaceholder}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${borderColor}`,
                  fontFamily: FB,
                  fontSize: 14,
                  color: textColor,
                  background: inputBg,
                }}
              />
            </label>

            {error && <p style={{ margin: 0, fontSize: 13, color: dangerColor }}>{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "13px",
                borderRadius: 12,
                border: "none",
                background: `linear-gradient(135deg, #E6BF66 0%, #C5922A 55%, #9A6E18 100%)`,
                color: "#fff",
                fontFamily: FB,
                fontSize: 15,
                fontWeight: 700,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {submitting ? ui.rsvpPublic.submitting : ui.rsvpPublic.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
