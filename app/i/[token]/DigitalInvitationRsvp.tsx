"use client";

import { useState } from "react";

import { InvitationArtwork } from "@/app/(app)/events/[id]/_tabs/InvitationArtwork";
import { InvitationCanvas } from "@/app/(app)/events/[id]/_tabs/InvitationCanvas";
import { digitalInvitationCopy } from "@/lib/digital-invitation-copy";
import type { Locale } from "@/lib/i18n";
import "./digital-invitation-rsvp.css";

type Status = "pending" | "attending" | "declined";

export function DigitalInvitationRsvp({ token, eventTitle, eventDateIso, fields, locale, photoUrl, householdLabel, maxAttendees, initialStatus, initialNames, closed }: {
  token: string; eventTitle: string; eventDateIso: string; fields: Record<string, string>; locale: Locale; photoUrl: string | null;
  householdLabel: string; maxAttendees: number; initialStatus: Status; initialNames: string[]; closed: boolean;
}) {
  const copy = digitalInvitationCopy(locale);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [names, setNames] = useState<string[]>(initialNames.length ? initialNames : [""]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(initialStatus !== "pending");
  const [error, setError] = useState<string | null>(null);
  const selectedTemplate = fields.selected_template ?? "wedding-invite-blue-floral";
  const canAdd = names.length < maxAttendees;

  function setName(index: number, value: string) { setNames(current => current.map((name, i) => i === index ? value : name)); }
  function choose(next: "attending" | "declined") { setStatus(next); setError(null); if (next === "attending" && names.length === 0) setNames([""]); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (closed) return;
    const attendeeNames = names.map(name => name.trim()).filter(Boolean);
    if (status === "pending") { setError(copy.responseFailed); return; }
    if (status === "attending" && attendeeNames.length === 0) { setError(copy.requiredName); return; }
    setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/digital-invitations/${token}/rsvp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, attendeeNames }) });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : copy.responseFailed);
      setNames(attendeeNames.length ? attendeeNames : [""]); setSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : copy.responseFailed); }
    finally { setSaving(false); }
  }

  return <main className="digital-rsvp">
    <div className="digital-rsvp__masthead"><span>Calisto</span><p>{copy.guestEyebrow}</p></div>
    <section className="digital-rsvp__invitation" aria-label={eventTitle}>
      <InvitationCanvas fields={{ ...fields, print_bleed: "0" }} preview>
        <InvitationArtwork templateId={selectedTemplate} fields={fields} eventDateIso={eventDateIso} locale={locale} photoUrl={photoUrl} />
      </InvitationCanvas>
    </section>
    <section className="digital-rsvp__response">
      <p>{copy.guestGreeting.replace("{household}", householdLabel)}</p><h1>{copy.guestTitle}</h1><span>{copy.guestIntro}</span>
      {closed ? <p className="digital-rsvp__closed">{copy.responseClosed}</p> : <form onSubmit={submit}>
        <div className="digital-rsvp__choices"><button type="button" data-active={status === "attending"} onClick={() => choose("attending")}>{copy.coming}</button><button type="button" data-active={status === "declined"} onClick={() => choose("declined")}>{copy.notComing}</button></div>
        {status === "attending" && <div className="digital-rsvp__names"><label>{copy.whoIsComing}</label>{names.map((name, index) => <div key={index}><input value={name} maxLength={120} placeholder={copy.attendeePlaceholder} onChange={event => setName(index, event.target.value)} />{names.length > 1 && <button type="button" aria-label="Remove attendee" onClick={() => setNames(current => current.filter((_, i) => i !== index))}>×</button>}</div>)}{canAdd && <button type="button" className="digital-rsvp__add" onClick={() => setNames(current => [...current, ""])}>+ {copy.addPerson}</button>}</div>}
        {error && <p className="digital-rsvp__error" role="alert">{error}</p>}
        <button className="digital-rsvp__submit" type="submit" disabled={saving || status === "pending"}>{saving ? "…" : saved ? copy.update : copy.submit}</button>
      </form>}
      {saved && !closed && <p className="digital-rsvp__saved" role="status">{copy.responseSaved}</p>}
    </section>
  </main>;
}
