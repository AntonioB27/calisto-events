"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { EVENT_KINDS, type EventKind } from "@/lib/event-kind";
import { listPrintTemplatesForEventKind } from "@/lib/event-print/template-catalog";

type PrintsTabProps = Readonly<{
  eventId: string;
  /** Current `events.event_kind` (may be default until gate completes). */
  eventKind: EventKind;
  /** When non-null, organizer completed the Prints event-type step. */
  printsEventKindSetAt: string | null;
}>;

export function PrintsTab({ eventId, eventKind, printsEventKindSetAt }: PrintsTabProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmKind(kind: EventKind) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/prints-confirm-event-kind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKind: kind }),
      });
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(typeof payload?.error === "string" ? payload.error : ui.printsTab.confirmKindFail);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.printsTab.confirmKindFail);
    } finally {
      setBusy(false);
    }
  }

  if (!printsEventKindSetAt) {
    return (
      <section style={{ maxWidth: 560 }}>
        <div style={{ marginBottom: 20 }}>
          <GoldBar />
          <p
            style={{
              marginTop: 12,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.printsTab.kindEyebrow}
          </p>
          <h2
            style={{
              marginTop: 8,
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 32,
              color: "var(--app-text)",
              lineHeight: 1.15,
            }}
          >
            {ui.printsTab.kindTitle}
          </h2>
          <p style={{ marginTop: 10, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.kindHint}</p>
        </div>

        {error ? (
          <p
            style={{
              marginBottom: 14,
              fontSize: 13,
              color: "var(--app-danger)",
              background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            }}
          >
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {EVENT_KINDS.map((k) => (
            <AppBtn
              key={k}
              type="button"
              variant="gold"
              className="w-full !justify-center"
              disabled={busy}
              loading={busy}
              onClick={() => void confirmKind(k)}
            >
              {k === "generic" ? ui.printsTab.kindOptionGeneric : ui.printsTab.kindOptionWedding}
            </AppBtn>
          ))}
        </div>
      </section>
    );
  }

  const templates = listPrintTemplatesForEventKind(eventKind);

  return (
    <section style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 22 }}>
        <GoldBar />
        <h2
          style={{
            marginTop: 12,
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 32,
            color: "var(--app-text)",
            lineHeight: 1.15,
          }}
        >
          {ui.printsTab.title}
        </h2>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>{ui.printsTab.subtitle}</p>
      </div>

      <AppCard pad="lg" style={{ borderRadius: 18 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          {ui.printsTab.catalogStubLead}{" "}
          <strong style={{ color: "var(--app-text)" }}>{templates.length}</strong> {ui.printsTab.catalogStubTrail}
        </p>
        <ul style={{ margin: "14px 0 0", paddingLeft: 18, fontSize: 14, color: "var(--app-text)", lineHeight: 1.65 }}>
          {templates.map((t) => (
            <li key={t.id}>
              <code style={{ fontSize: 13 }}>{t.id}</code> — {t.category}
            </li>
          ))}
        </ul>
      </AppCard>
    </section>
  );
}
