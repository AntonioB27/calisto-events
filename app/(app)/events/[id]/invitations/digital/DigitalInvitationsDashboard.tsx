"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { digitalInvitationCopy } from "@/lib/digital-invitation-copy";
import type { Locale } from "@/lib/i18n";
import "./digital-invitations.css";

type Household = {
  id: string;
  label: string;
  token: string;
  maxAttendees: number;
  responseStatus: "pending" | "attending" | "declined";
  respondedAt: string | null;
  attendeeNames: string[];
};

export function DigitalInvitationsDashboard({ eventId, eventName, origin, locale, publishedAt, households }: {
  eventId: string; eventName: string; origin: string; locale: Locale; publishedAt: string | null; households: Household[];
}) {
  const copy = digitalInvitationCopy(locale);
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState("");
  const [maxAttendees, setMaxAttendees] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const totals = useMemo(() => ({
    confirmed: households.filter(h => h.responseStatus === "attending").reduce((sum, h) => sum + h.attendeeNames.length, 0),
    responses: households.filter(h => h.responseStatus !== "pending").length,
  }), [households]);

  async function publish() {
    setPublishing(true); setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/digital-invitations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish" }) });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch { setError(copy.saveFailed); }
    finally { setPublishing(false); }
  }

  async function createHousehold(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/digital-invitations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create-household", label, maxAttendees }) });
      if (!response.ok) throw new Error();
      setLabel(""); setMaxAttendees(1); router.refresh();
    } catch { setError(copy.saveFailed); }
    finally { setCreating(false); }
  }

  async function copyLink(token: string) {
    try { await navigator.clipboard.writeText(`${origin}/i/${token}`); setCopied(token); }
    catch { setError(copy.saveFailed); }
  }

  return <main className="digital-invitations">
    <header className="digital-invitations__masthead">
      <div>
        <Link href={`/events/${eventId}/invitations`} className="digital-invitations__back">← {copy.back}</Link>
        <p>{eventName}</p><h1>{copy.title}</h1>
      </div>
      <div className="digital-invitations__count"><strong>{totals.confirmed}</strong><span>{copy.confirmed}</span></div>
    </header>
    <p className="digital-invitations__intro">{copy.description}</p>
    {error && <p role="alert" className="digital-invitations__error">{error}</p>}

    {!publishedAt && <section className="digital-invitations__guide">
      <p>{copy.guideKicker}</p><h2>{copy.guideTitle}</h2>
      <ol>
        <li><span>01</span><div><h3>{copy.guidePublish}</h3><p>{copy.guidePublishBody}</p></div></li>
        <li><span>02</span><div><h3>{copy.guideHouseholds}</h3><p>{copy.guideHouseholdsBody}</p></div></li>
        <li><span>03</span><div><h3>{copy.guideResponses}</h3><p>{copy.guideResponsesBody}</p></div></li>
      </ol>
    </section>}

    <section className="digital-invitations__publish">
      <div><span>{publishedAt ? copy.published : copy.title}</span><p>{copy.publishHint}</p></div>
      <AppBtn variant="gold" loading={publishing} onClick={() => void publish()}>{publishedAt ? copy.republish : copy.publish}</AppBtn>
    </section>

    {publishedAt && <>
      <section className="digital-invitations__recipients">
        <div className="digital-invitations__section-head"><div><h2>{copy.householdTitle}</h2><p>{copy.householdHint}</p></div><div className="digital-invitations__totals"><strong>{totals.responses}/{households.length}</strong><span>{copy.responseSummary}</span></div></div>
        <form className="digital-invitations__new-household" onSubmit={createHousehold}>
          <label>{copy.householdLabel}<input value={label} maxLength={120} required placeholder={copy.householdPlaceholder} onChange={event => setLabel(event.target.value)} /></label>
          <label>{copy.partySize}<input type="number" min="1" max="20" value={maxAttendees} onChange={event => setMaxAttendees(Number(event.target.value))} /></label>
          <AppBtn variant="outline" type="submit" loading={creating}>{copy.create}</AppBtn>
        </form>
        {households.length === 0 ? <p className="digital-invitations__empty">{copy.noHouseholds}</p> : <ul className="digital-invitations__list">
          {households.map(household => <li key={household.id}>
            <div><h3>{household.label}</h3><p>{household.responseStatus === "attending" ? household.attendeeNames.join(", ") : household.responseStatus === "declined" ? "—" : `${copy.partySize}: ${household.maxAttendees}`}</p></div>
            <span data-status={household.responseStatus}>{copy[household.responseStatus]}</span>
            <button type="button" onClick={() => void copyLink(household.token)}>{copied === household.token ? copy.copied : copy.copy}</button>
          </li>)}
        </ul>}
      </section>
    </>}
  </main>;
}
