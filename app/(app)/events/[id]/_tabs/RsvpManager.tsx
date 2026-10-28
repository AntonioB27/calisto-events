"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora } from "@/components/app-ui/Aurora";
import { AuroraHourglass } from "@/components/app-ui/AuroraHourglass";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { FilterChips } from "@/components/app-ui/FilterChips";
import { Switch } from "@/components/app-ui/Switch";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import type { RsvpAttendee } from "@/lib/rsvp-duplicate";

import { relativeTime } from "./AlbumReview";
import "./rsvp-prints.css";

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

type Filter = "all" | "confirmed" | "declined";
type PendingConfirm = { kind: "regen" } | { kind: "delete"; row: RsvpRow } | null;

function getRsvpUrl(publicOrigin: string, code: string): string {
  return `${publicOrigin.replace(/\/$/, "")}/rsvp/${encodeURIComponent(code)}`;
}

export function RsvpManager({ eventId, publicOrigin }: RsvpManagerProps) {
  const ui = useAppUi();
  const t = ui.rsvpTab;
  const locale = ui.locale;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpCode, setRsvpCode] = useState<string | null>(null);
  const [rsvpOpen, setRsvpOpen] = useState(true);
  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [regenBusy, setRegenBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

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
    for (const row of rows) {
      if (row.status === "confirmed") {
        confirmedParties += 1;
        attendees += row.attendees?.length ?? 0;
      } else {
        declinedParties += 1;
      }
    }
    return { confirmedParties, declinedParties, attendees };
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

  async function runConfirmed() {
    if (!pendingConfirm) return;
    if (pendingConfirm.kind === "regen") await regenerateCode();
    else await handleDelete(pendingConfirm.row.id);
    setPendingConfirm(null);
  }

  if (loading) {
    return <AuroraHourglass caption={ui.rsvpPublic.loading} style={{ padding: "48px 0" }} />;
  }

  const rsvpUrl = rsvpCode ? getRsvpUrl(publicOrigin, rsvpCode) : null;
  const flagged = rows.filter((r) => r.duplicate_status === "flagged");
  const visibleRows = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <section className="rsvp-tab welcome-reveal">
      <TabHeader title={t.title} pose="planning">
        {rows.length === 0 ? (
          t.subtitle
        ) : (
          <>
            <b>{plural(locale, stats.attendees, t.summaryComing)}</b>{" "}
            {interpolate(t.summaryRest, {
              confirmed: plural(locale, stats.confirmedParties, t.summaryConfirmed),
              declined: plural(locale, stats.declinedParties, t.summaryDeclined),
            })}
          </>
        )}
      </TabHeader>
      {rows.length > 0 && (
        <div className="rsvp-bar" aria-hidden>
          <span className="rsvp-bar__yes" style={{ width: `${(stats.confirmedParties / rows.length) * 100}%` }} />
          <span className="rsvp-bar__no" />
        </div>
      )}

      {error && (
        <p className="rsvp-error" role="alert">
          {error}
        </p>
      )}

      <section className="tab-card tab-card--raised" aria-label={t.linkLabel}>
        <Switch
          checked={rsvpOpen}
          onChange={() => void toggleOpen()}
          busy={toggleBusy}
          label={t.openToggleOn}
          description={rsvpOpen ? t.openToggleDesc : t.openToggleOff}
        />
        {rsvpUrl && (
          <>
            <div className="rsvp-link__row">
              <div className="rsvp-link__qr" role="img" aria-label={t.scanQr}>
                <QRCode value={rsvpUrl} size={58} />
              </div>
              <div className="rsvp-link__body">
                <p className="rsvp-link__url" title={rsvpUrl}>
                  {rsvpUrl.replace(/^https?:\/\//, "")}
                </p>
                <div className="rsvp-link__actions">
                  <AppBtn variant="secondary" className="rsvp-btn" onClick={() => void copyLink()}>
                    {copied ? ui.common.copied : t.copyLink}
                  </AppBtn>
                  <AppBtn variant="gold" className="rsvp-btn" onClick={() => void shareLink()}>
                    {t.shareLink}
                  </AppBtn>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="rsvp-textbtn"
              disabled={regenBusy}
              onClick={() => setPendingConfirm({ kind: "regen" })}
            >
              {t.regenerateCode}
            </button>
          </>
        )}
      </section>

      {flagged.map((row) => {
        const other = row.possible_duplicate_of ? rowById.get(row.possible_duplicate_of) : undefined;
        const busy = busyId === row.id;
        return (
          <section key={row.id} className="rsvp-dup" aria-label={t.duplicateTitle}>
            <p className="rsvp-dup__title">{t.duplicateTitle}</p>
            <p className="rsvp-dup__body">
              {other ? interpolate(t.duplicatePair, { a: row.submitter_name, b: other.submitter_name }) : row.submitter_name}
              {other ? ` · ${t.duplicateMergeHint}` : null}
            </p>
            <div className="rsvp-dup__actions">
              <AppBtn
                variant="secondary"
                className="rsvp-btn rsvp-btn--ink"
                loading={busy}
                onClick={() => void handleDuplicateAction(row.id, "merge")}
              >
                {t.duplicateMerge}
              </AppBtn>
              <AppBtn
                variant="ghost"
                className="rsvp-btn"
                disabled={busy}
                onClick={() => void handleDuplicateAction(row.id, "dismiss")}
              >
                {t.duplicateDismiss}
              </AppBtn>
            </div>
          </section>
        );
      })}

      {rows.length === 0 ? (
        <div className="tab-card rsvp-empty">
          <Aurora pose="waving" size={96} />
          <p>{t.emptyState}</p>
        </div>
      ) : (
        <>
          <FilterChips<Filter>
            ariaLabel={t.filterAria}
            value={filter}
            onChange={setFilter}
            chips={[
              { id: "all", label: interpolate(t.filterAll, { count: rows.length }) },
              { id: "confirmed", label: interpolate(t.filterConfirmed, { count: stats.confirmedParties }) },
              { id: "declined", label: interpolate(t.filterDeclined, { count: stats.declinedParties }) },
            ]}
          />
          {visibleRows.length > 0 && (
            <ul className="warm-list">
              {visibleRows.map((row) => {
                const adults = row.attendees?.filter((a) => a.type === "adult").length ?? 0;
                const children = row.attendees?.filter((a) => a.type === "child").length ?? 0;
                const counts = [
                  adults > 0 ? plural(locale, adults, t.adults) : null,
                  children > 0 ? plural(locale, children, t.children) : null,
                ]
                  .filter(Boolean)
                  .join(", ");
                const updated = row.updated_at !== row.created_at;
                const when = updated ? row.updated_at : row.created_at;
                const confirmed = row.status === "confirmed";
                const actionsId = `rsvp-row-actions-${row.id}`;
                const expanded = openRowId === row.id;
                return (
                  <li key={row.id}>
                    <div className="rsvp-row">
                      <div className="rsvp-row__main">
                        <div className="rsvp-row__head">
                          <span className="rsvp-row__name">{row.submitter_name}</span>
                          <span className={`rsvp-pill ${confirmed ? "rsvp-pill--yes" : "rsvp-pill--no"}`}>
                            {confirmed ? t.listStatusConfirmed : t.listStatusDeclined}
                          </span>
                        </div>
                        {confirmed && row.attendees?.length > 0 && (
                          <span className="rsvp-row__people">
                            {row.attendees.map((a) => a.name).join(", ")}
                            {counts ? ` · ${counts}` : ""}
                          </span>
                        )}
                        <span className="rsvp-row__meta">
                          {row.contact ? `${row.contact} · ` : null}
                          <time dateTime={when}>
                            {interpolate(updated ? t.listUpdatedOn : t.listSubmittedOn, { date: relativeTime(when, locale) })}
                          </time>
                        </span>
                      </div>
                      <button
                        type="button"
                        className="rsvp-more"
                        aria-label={interpolate(t.rowOptions, { name: row.submitter_name })}
                        aria-expanded={expanded}
                        aria-controls={actionsId}
                        onClick={() => setOpenRowId(expanded ? null : row.id)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <circle cx="5" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="19" cy="12" r="1.8" />
                        </svg>
                      </button>
                    </div>
                    {expanded && (
                      <div id={actionsId} className="rsvp-row__actions">
                        <AppBtn
                          variant="danger"
                          className="rsvp-btn"
                          disabled={busyId === row.id}
                          onClick={() => setPendingConfirm({ kind: "delete", row })}
                        >
                          {t.deleteEntry}
                        </AppBtn>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingConfirm !== null}
        title={pendingConfirm?.kind === "delete" ? pendingConfirm.row.submitter_name : t.regenerateCode}
        message={pendingConfirm?.kind === "delete" ? t.deleteConfirm : t.regenerateConfirm}
        confirmLabel={pendingConfirm?.kind === "delete" ? t.deleteEntry : t.regenerateCode}
        cancelLabel={ui.common.cancel}
        variant={pendingConfirm?.kind === "delete" ? "danger" : "default"}
        busy={pendingConfirm?.kind === "delete" ? busyId === pendingConfirm.row.id : regenBusy}
        onConfirm={() => void runConfirmed()}
        onCancel={() => setPendingConfirm(null)}
      />
    </section>
  );
}
