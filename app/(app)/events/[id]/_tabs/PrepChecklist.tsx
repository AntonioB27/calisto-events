"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

import { PREP_COLS, prepSteps, type PrepData, type PrepItem, type PrepStep } from "./prep-items";

const TABLE = "event_checklist_items";
const LABEL_MAX = 200;

function CheckButton({ done, label, disabled, onToggle }: Readonly<{ done: boolean; label: string; disabled?: boolean; onToggle: () => void }>) {
  return (
    <button type="button" className="prep-check" aria-pressed={done} aria-label={label} disabled={disabled} onClick={onToggle}>
      <span className="prep-check__box">{done ? <Check size={15} strokeWidth={3} aria-hidden /> : null}</span>
    </button>
  );
}

/** Home before the event: Calisto's prep steps plus the organizer's own items, shared with co-organizers. */
export function PrepChecklist({
  eventId,
  accessCode,
  isPrimaryOrganizer,
  prep,
}: Readonly<{ eventId: string; accessCode: string; isPrimaryOrganizer: boolean; prep: PrepData }>) {
  const ui = useAppUi();
  const t = ui.soon;
  const locale = bcp47FromUiLocale(ui.locale);
  const [rows, setRows] = useState<readonly PrepItem[]>(prep.rows);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const tab = (id: string) => `/events/${eventId}?tab=${id}`;
  const copy: Record<PrepStep, { text: string; meta: string | null; action: string; href: string; external?: boolean }> = {
    invites: {
      text: t.stepInvites,
      meta: prep.rsvpConfirmed ? plural(locale, prep.rsvpConfirmed, t.stepInvitesMeta) : null,
      action: t.stepInvitesAction,
      href: tab("rsvp"),
    },
    // Prints are organizer-only; co-organizers get the share tab, where the QR lives.
    qr: { text: t.stepQr, meta: t.stepQrMeta, action: t.stepQrAction, href: tab(isPrimaryOrganizer ? "prints" : "share") },
    share: { text: t.stepShare, meta: t.stepShareMeta, action: t.stepShareAction, href: tab("share") },
    co: { text: t.stepCo, meta: t.stepCoMeta, action: t.stepCoAction, href: tab("guests") },
    moderation: { text: t.stepModeration, meta: t.stepModerationMeta, action: t.stepModerationAction, href: tab("settings") },
    peek: { text: t.stepPeek, meta: t.stepPeekMeta, action: t.stepPeekAction, href: `/join/${encodeURIComponent(accessCode)}`, external: true },
  };

  const steps = prepSteps(prep, rows, isPrimaryOrganizer);
  const own = rows.filter((r) => r.step === null);
  const total = steps.length + own.length;
  const doneCount = steps.filter((s) => s.done).length + own.filter((r) => r.done).length;
  const left = total - doneCount;
  const toggleLabel = (done: boolean, label: string) => interpolate(done ? t.markUndone : t.markDone, { label });

  /** Optimistic write: show `next` now, put `prev` back if the save fails. */
  async function save(next: readonly PrepItem[], write: () => PromiseLike<{ error: unknown }>) {
    const prev = rows;
    setRows(next);
    setError(null);
    const { error: err } = await write();
    if (err) {
      setRows(prev);
      setError(t.saveFailed);
    }
  }

  async function setStepDone(step: PrepStep, done: boolean) {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;
    const has = rows.some((r) => r.step === step);
    const next = has ? rows.map((r) => (r.step === step ? { ...r, done } : r)) : [...rows, { id: `new-${step}`, step, label: null, done }];
    await save(next, () => supabase.from(TABLE).upsert({ event_id: eventId, step, done }, { onConflict: "event_id,step" }));
  }

  async function setOwnDone(item: PrepItem, done: boolean) {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase || item.id.startsWith("new-")) return;
    await save(rows.map((r) => (r.id === item.id ? { ...r, done } : r)), () => supabase.from(TABLE).update({ done }).eq("id", item.id));
  }

  async function removeOwn(item: PrepItem) {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase || item.id.startsWith("new-")) return;
    await save(rows.filter((r) => r.id !== item.id), () => supabase.from(TABLE).delete().eq("id", item.id));
  }

  async function addOwn(e: React.FormEvent) {
    e.preventDefault();
    const label = draft.trim().slice(0, LABEL_MAX);
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!label || !supabase) return;
    const tempId = `new-${Date.now()}`;
    setDraft("");
    setError(null);
    setRows((cur) => [...cur, { id: tempId, step: null, label, done: false }]);
    const { data, error: err } = await supabase.from(TABLE).insert({ event_id: eventId, label }).select(PREP_COLS).single();
    if (err || !data) {
      setRows((cur) => cur.filter((r) => r.id !== tempId));
      setDraft(label);
      setError(t.saveFailed);
      return;
    }
    setRows((cur) => cur.map((r) => (r.id === tempId ? (data as PrepItem) : r)));
  }

  return (
    <section aria-label={ui.eventShell.nextStep} className="event-next" style={{ marginTop: 72, paddingTop: 16 }}>
      <Aurora pose="planning" size={112} style={{ position: 'absolute', right: 6, top: -70 }} />
      <AuroraSays size={22} style={{ paddingRight: 112, minHeight: 30, lineHeight: 1.15 }}>
        {left === 0 ? t.checklistDone : plural(locale, left, t.checklistLeft)}
      </AuroraSays>
      <div className="prep-progress">
        <div aria-hidden className="prep-progress__bar">
          <span style={{ transform: `scaleX(${total ? doneCount / total : 0})` }} />
        </div>
        <span className="prep-progress__text">{interpolate(t.checklistProgress, { done: doneCount, total })}</span>
      </div>

      <ul className="prep-list">
        {steps.map(({ step, auto, done }) => {
          const c = copy[step];
          return (
            <li key={step} className={`prep-item${done ? " is-done" : ""}`}>
              {/* Steps Calisto ticks itself (RSVPs in, guests joined, ...) stay ticked. */}
              <CheckButton done={done} disabled={auto} label={toggleLabel(done, c.text)} onToggle={() => void setStepDone(step, !done)} />
              <span className="prep-item__text">
                <span className="prep-item__title">{c.text}</span>
                {c.meta ? <span className="prep-item__meta">{c.meta}</span> : null}
              </span>
              {done ? null : c.external ? (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prep-item__action"
                  onClick={() => void setStepDone(step, true)}
                >
                  {c.action} ›
                </a>
              ) : (
                <Link href={c.href} className="prep-item__action">{c.action} ›</Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="prep-own-label" id="prep-own-label">{t.yourItems}</div>
      {own.length > 0 ? (
        <ul className="prep-list prep-list--own" aria-labelledby="prep-own-label">
          {own.map((item) => (
            <li key={item.id} className={`prep-item${item.done ? " is-done" : ""}`}>
              <CheckButton done={item.done} label={toggleLabel(item.done, item.label ?? "")} onToggle={() => void setOwnDone(item, !item.done)} />
              <span className="prep-item__text">
                <span className="prep-item__title">{item.label}</span>
              </span>
              <button type="button" className="prep-remove" aria-label={interpolate(t.removeItem, { label: item.label ?? "" })} onClick={() => void removeOwn(item)}>
                <X size={18} strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <form className="prep-add" onSubmit={(e) => void addOwn(e)}>
        <label htmlFor="prep-new-item" className="sr-only">{t.newItemLabel}</label>
        <input
          id="prep-new-item"
          type="text"
          value={draft}
          maxLength={LABEL_MAX}
          placeholder={t.newItemPlaceholder}
          autoComplete="off"
          enterKeyHint="done"
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" aria-label={t.addItem} disabled={!draft.trim()}>
          <Plus size={20} strokeWidth={2.4} aria-hidden />
        </button>
      </form>
      {error ? (
        <p role="alert" style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--app-danger)' }}>{error}</p>
      ) : null}
    </section>
  );
}
