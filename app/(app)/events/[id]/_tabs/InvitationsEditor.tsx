"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppUi } from '@/components/AppUiProvider';
import type { AppUiDict } from '@/lib/app-ui';
import { AppBtn } from '@/components/app-ui/AppBtn';
import type { EventKind } from '@/lib/event-kind';
import type { Locale } from '@/lib/i18n';
import { maybeCreateSupabaseBrowserClient } from '@/lib/supabase-browser';
import { defaultFieldValuesForTemplate } from '@/lib/event-print/print-field-defaults';
import { listPrintTemplatesForEventKind } from '@/lib/event-print/template-catalog';
import { INVITATION_DOCUMENT_ID, INVITATION_FORMATS, mergeInvitationDocuments, selectedInvitation } from '@/lib/event-print/invitation-document';
import { invitationWorkspaceCopy } from '@/lib/event-print/invitation-workspace-copy';
import { invitationCapabilities } from '@/lib/event-print/invitation-capabilities';
import { invitationVisibilityToggleLabel } from '@/lib/event-print/invitation-visibility-ui-labels';
import { InvitationArtwork } from './InvitationArtwork';
import { InvitationPreflight } from './InvitationPreflight';
import { InvitationCanvas } from './InvitationCanvas';
import { InvitePhotoUpload } from './InvitePhotoUpload';
import '../print/print-sheet.css';
import './invitation-workspace.css';

function templateCardTitle(id: string, tab: AppUiDict["printsTab"]): string {
  switch (id) {
    case "table-minimal": return tab.templateTableMinimal;
    case "table-bold": return tab.templateTableBold;
    case "wedding-invite-blue-floral": return tab.templateWeddingInviteBlueFloral;
    case "wedding-invite-geometric": return tab.templateWeddingInviteGeometric;
    case "wedding-invite-watercolor-coast": return tab.templateWeddingInviteWatercolorCoast;
    case "wedding-invite-navy-botanical": return tab.templateWeddingInviteNavyBotanical;
    case "wedding-invite-grayscale-glitter": return tab.templateWeddingInviteGrayscaleGlitter;
    case "wedding-invite-terra-pill": return tab.templateWeddingInviteTerraPill;
    case "wedding-invite-gold-arch-floral": return tab.templateWeddingInviteGoldArchFloral;
    case "wedding-invite-cherry-blossom": return tab.templateWeddingInviteCherryBlossom;
    case "wedding-invite-olive-gold-frame": return tab.templateWeddingInviteOliveGoldFrame;
    case "wedding-invite-gold-circles-photo": return tab.templateWeddingInviteGoldCirclesPhoto;
    default: return id;
  }
}

export function InvitationsEditor({ eventId, eventKind, eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId }: {
  eventId: string; eventKind: EventKind; eventDisplayName: string; eventDateIso: string; uiLocale: Locale;
  printDraftByTemplateId: Readonly<Record<string, Record<string, string>>>;
}) {
  const ui = useAppUi(); const copy = invitationWorkspaceCopy(uiLocale); const router = useRouter();
  const initial = useMemo(() => ({ ...defaultFieldValuesForTemplate(INVITATION_DOCUMENT_ID, eventDisplayName, eventDateIso, uiLocale),
    selected_template: INVITATION_DOCUMENT_ID, font_scale: '100', print_format: 'a5', print_bleed: '3', content_locale: uiLocale,
    ...mergeInvitationDocuments(printDraftByTemplateId) }), [eventDisplayName, eventDateIso, uiLocale, printDraftByTemplateId]);
  const [fields, setFields] = useState<Record<string, string>>(initial);
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const expected = useRef<Record<string, string> | null>(printDraftByTemplateId[INVITATION_DOCUMENT_ID] ?? null);
  const [saving, setSaving] = useState(false); const savingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false); const [photoRetry, setPhotoRetry] = useState(0);
  const [recovery, setRecovery] = useState<Record<string, string> | null>(null);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('preview');
  const storageKey = `calisto:invitation:${eventId}`;
  // A new invitation starts with a usable default proof. It only becomes
  // unsaved once the organizer changes that proof; Review & print still
  // creates the first canonical draft even when nothing was edited.
  const dirty = JSON.stringify(fields) !== JSON.stringify(saved);
  const busy = saving || uploading;
  const activeId = selectedInvitation(fields);
  const capabilities = invitationCapabilities(activeId);
  const templates = listPrintTemplatesForEventKind(eventKind).filter(t => t.category === 'invitation');
  const contentLocale = (['en', 'hr', 'de'].includes(fields.content_locale) ? fields.content_locale : uiLocale) as Locale;
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const change = useCallback((patch: Record<string, string>) => { setFields(prev => ({ ...prev, ...patch })); setError(null); }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) { const value = JSON.parse(raw); if (value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(v => typeof v === 'string')) setRecovery(value); }
    } catch { /* Storage is optional; saving to the server remains available. */ }
    setRecoveryReady(true);
  }, [storageKey]);
  useEffect(() => {
    // The app shell owns the scroll container. Reset it when entering this
    // dedicated route so a previous Prints-tab scroll cannot hide the masthead.
    document.querySelector<HTMLElement>('.app-shell > main')?.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    if (!recoveryReady || recovery) return;
    try { if (dirty) localStorage.setItem(storageKey, JSON.stringify(fields)); else localStorage.removeItem(storageKey); } catch { /* Private browsing/quota. */ }
  }, [fields, dirty, storageKey, recoveryReady, recovery]);
  useEffect(() => {
    if (!dirty && !uploading) return;
    function beforeUnload(e: BeforeUnloadEvent) { e.preventDefault(); }
    window.addEventListener('beforeunload', beforeUnload);
    // Also protect ordinary in-app links, which do not fire beforeunload.
    function followLink(e: MouseEvent) {
      const link = (e.target as Element).closest?.('a[href]');
      if (link && !window.confirm(copy.discardConfirm)) { e.preventDefault(); e.stopPropagation(); }
    }
    document.addEventListener('click', followLink, true);
    return () => { window.removeEventListener('beforeunload', beforeUnload); document.removeEventListener('click', followLink, true); };
  }, [dirty, uploading, copy.discardConfirm]);
  useEffect(() => {
    let cancelled = false;
    setPhotoUrl(null); setPhotoError(false);
    const path = fields.couple_photo_path;
    if (!path) return;
    if (!supabase) { setPhotoError(true); return; }
    void supabase.storage.from('event-media').createSignedUrl(path, 3600).then(({ data, error }: { data: { signedUrl: string } | null; error: unknown }) => {
      if (cancelled) return;
      if (error || !data?.signedUrl) setPhotoError(true); else setPhotoUrl(data.signedUrl);
    }).catch(() => { if (!cancelled) setPhotoError(true); });
    const refresh = window.setTimeout(() => setPhotoRetry(n => n + 1), 50 * 60 * 1000);
    return () => { cancelled = true; window.clearTimeout(refresh); };
  }, [fields.couple_photo_path, supabase, photoRetry]);

  async function save() {
    if (savingRef.current || uploading) return false;
    if (!fields.partner_a?.trim() || !fields.partner_b?.trim()) { setError(copy.required); setMobileView('edit'); return false; }
    savingRef.current = true; setSaving(true); setError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/invitation-drafts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fieldValues: fields, expectedFields: expected.current }) });
      const result = await response.json();
      if (!response.ok) { setError(response.status === 409 ? copy.conflict : copy.failed); return false; }
      expected.current = result.fieldValues;
      setFields(result.fieldValues); setSaved(result.fieldValues);
      try { localStorage.removeItem(storageKey); } catch { /* optional */ }
      return true;
    } catch { setError(copy.failed); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  const labels: Record<string, string> = {
    partner_a: ui.printsTab.inviteFieldPartnerA, partner_b: ui.printsTab.inviteFieldPartnerB,
    venue: ui.printsTab.inviteFieldVenue, venue_line_2: ui.printsTab.inviteFieldVenueLineTwo, extra_line: ui.printsTab.inviteFieldExtraLine,
    gathering_address: ui.printsTab.inviteFieldGatheringAddress, gathering_time: ui.printsTab.inviteFieldGatheringTime,
    partner_a_gathering_address: `${ui.printsTab.inviteFieldPartnerA} · ${ui.printsTab.inviteFieldGatheringAddress}`, partner_a_gathering_time: `${ui.printsTab.inviteFieldPartnerA} · ${ui.printsTab.inviteFieldGatheringTime}`,
    partner_b_gathering_address: `${ui.printsTab.inviteFieldPartnerB} · ${ui.printsTab.inviteFieldGatheringAddress}`, partner_b_gathering_time: `${ui.printsTab.inviteFieldPartnerB} · ${ui.printsTab.inviteFieldGatheringTime}`,
    church_address: ui.printsTab.inviteFieldChurchAddress, church_time: ui.printsTab.inviteFieldChurchTime, dinner_address: ui.printsTab.inviteFieldDinnerAddress, dinner_time: ui.printsTab.inviteFieldDinnerTime,
    quote_text: ui.printsTab.inviteFieldQuoteText, quote_author: ui.printsTab.inviteFieldQuoteAuthor,
  };
  function input(key: string) {
    const def = capabilities.fields.find(f => f.key === key);
    if (!def) return null;
    return <label key={key} className="invitation-field">{labels[key] ?? key}
      <input value={fields[key] ?? ''} maxLength={def.maxLength} required={def.required} onChange={e => change({ [key]: e.target.value })} />
    </label>;
  }
  const unsupported = Object.entries(fields).some(([key, value]) => value.trim() && key in labels && !capabilities.fields.some(f => f.key === key));
  const photoPending = capabilities.photo && !!fields.couple_photo_path && !photoUrl;
  return <section className="invitation-workspace" data-view={mobileView}>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    {/* eslint-disable-next-line @next/next/no-page-custom-font */}
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&display=swap" rel="stylesheet" />
    <header className="invitation-workspace__masthead">
      <div>
        <h1>{eventDisplayName}</h1>
        <p>{templateCardTitle(activeId, ui.printsTab)}</p>
      </div>
      <span aria-hidden="true" />
    </header>
    <div className="invitation-workspace__toolbar">
      <span role="status">{saving ? copy.saving : dirty ? copy.unsaved : copy.saved}</span>
      <div className="invitation-workspace__actions">
        <button type="button" disabled={busy || !dirty} onClick={() => { if (window.confirm(copy.discardConfirm)) { setFields(saved); setError(null); } }}>{copy.discard}</button>
        <AppBtn variant="outline" size="sm" disabled={busy || !dirty} onClick={() => void save()}>{copy.save}</AppBtn>
        <AppBtn variant="gold" size="sm" disabled={busy || photoPending} onClick={async () => { if (await save()) router.push(`/events/${eventId}/print?template=${activeId}&posterLang=${contentLocale}`); }}>{copy.export}</AppBtn>
      </div>
    </div>
    {error && <p className="invitation-notice" role="alert">{error}</p>}
    {recovery && <div className="invitation-notice"><p>{copy.recovered}</p><button type="button" onClick={() => { setFields(recovery); setRecovery(null); }}>{copy.restore}</button><button type="button" onClick={() => setRecovery(null)}>{copy.dismiss}</button></div>}
    <div className="invitation-workspace__mobile-switch"><button type="button" aria-pressed={mobileView === 'edit'} onClick={() => setMobileView('edit')}>{copy.edit}</button><button type="button" aria-pressed={mobileView === 'preview'} onClick={() => setMobileView('preview')}>{copy.preview}</button></div>
    <div className="invitation-workspace__layout">
      <aside className="invitation-workspace__inspector">
        <fieldset disabled={busy}>
          <h2>{copy.details}</h2>
          <details open><summary>{copy.essentials}</summary><div className="invitation-fields">{['partner_a','partner_b','venue','venue_line_2','extra_line'].map(input)}
            <label className="invitation-field">{copy.date}<input readOnly value={eventDateIso ? new Date(eventDateIso).toLocaleDateString(uiLocale, { timeZone: 'UTC' }) : '—'} /><small>{copy.dateHint}</small></label>
          </div></details>
          {capabilities.details && <details><summary>{copy.schedule}</summary><div className="invitation-fields">
            <label className="invitation-field">{ui.printsTab.inviteFieldGatheringLabel}<select value={fields.gathering_type ?? ''} onChange={e => change({ gathering_type: e.target.value })}><option value="">{ui.printsTab.inviteFieldGatheringNone}</option><option value="same">{ui.printsTab.inviteFieldGatheringSame}</option><option value="separate">{ui.printsTab.inviteFieldGatheringSeparate}</option></select></label>
            {(fields.gathering_type === 'same' ? ['gathering_address','gathering_time'] : fields.gathering_type === 'separate' ? ['partner_a_gathering_address','partner_a_gathering_time','partner_b_gathering_address','partner_b_gathering_time'] : []).map(input)}
            {['church_address','church_time','dinner_address','dinner_time'].map(input)}
          </div></details>}
          {capabilities.details && <details><summary>{copy.wording}</summary><div className="invitation-fields">{['quote_text','quote_author'].map(input)}</div></details>}
          {capabilities.photo && <details open><summary>{ui.print.inviteGoldCirclesUploadPhoto}</summary><InvitePhotoUpload eventId={eventId} fields={fields} photoUrl={photoUrl} locale={uiLocale} disabled={saving} onChange={change} onBusy={setUploading} onPhoto={setPhotoUrl} />
            {photoError && <p role="alert">{copy.loadFail} <button type="button" onClick={() => setPhotoRetry(n => n + 1)}>{copy.retry}</button></p>}
          </details>}
          <details><summary>{copy.visibility}</summary><div className="invitation-fields">{capabilities.visibility.map(key => <label className="invitation-check" key={key}><input type="checkbox" checked={fields[`show_${key}`] !== '0'} onChange={e => change({ [`show_${key}`]: e.target.checked ? '1' : '0' })} />{invitationVisibilityToggleLabel(ui.printsTab, key)}</label>)}</div></details>
          <details open><summary>{copy.production}</summary><div className="invitation-fields">
            <label className="invitation-field">{copy.format}<select value={fields.print_format} onChange={e => change({ print_format: e.target.value })}>{Object.entries(INVITATION_FORMATS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label>
            <label className="invitation-field">{copy.bleed}<select value={fields.print_bleed} onChange={e => change({ print_bleed: e.target.value })}><option value="3">{copy.bleedThree}</option><option value="0">{copy.bleedNone}</option></select></label>
            <label className="invitation-field">{copy.language}<select value={contentLocale} onChange={e => change({ content_locale: e.target.value })}>{(['hr','en','de'] as const).map(locale => <option key={locale} value={locale}>{ui.languagePicker.locales[locale]}</option>)}</select></label>
            {capabilities.fields.some(f => f.key === 'connector_symbol') && <label className="invitation-field">{ui.printsTab.inviteFieldConnectorLabel}<select value={fields.connector_symbol || 'ampersand'} onChange={e => change({ connector_symbol: e.target.value })}><option value="ampersand">&amp;</option><option value="heart">{ui.printsTab.inviteFieldConnectorHeart}</option><option value="infinity">{ui.printsTab.inviteFieldConnectorInfinity}</option></select></label>}
            <label className="invitation-field">{copy.typography} · {fields.font_scale}%<input type="range" min="70" max="150" step="5" value={fields.font_scale} onChange={e => change({ font_scale: e.target.value })} /></label>
          </div></details>
        </fieldset>
      </aside>
      <div className="invitation-workspace__studio">
        <div className="invitation-workspace__proof-head"><h2>{copy.proof}</h2><span>{INVITATION_FORMATS[fields.print_format === '5x7' ? '5x7' : 'a5'].label}</span></div>
        <div className="invitation-workspace__proof-stage">
          <div id="invitation-editor-proof" className="invitation-workspace__proof"><InvitationCanvas fields={fields} guides><InvitationArtwork templateId={activeId} fields={fields} eventDateIso={eventDateIso} locale={contentLocale} photoUrl={photoUrl} /></InvitationCanvas></div>
        </div>
        <p className="invitation-workspace__caption">{templateCardTitle(activeId, ui.printsTab)}</p>
        {unsupported && <p className="invitation-notice">{copy.unsupported}</p>}
        <details className="invitation-workspace__designs" open><summary>{copy.design} · {templates.length}</summary><div className="invitation-design-grid">{templates.map(template => <button key={template.id} type="button" disabled={busy} aria-pressed={activeId === template.id} onClick={() => change({ selected_template: template.id })}>
          <span className="invitation-design-grid__thumb" aria-hidden="true"><InvitationCanvas fields={{ ...fields, print_bleed: '0' }}><InvitationArtwork templateId={template.id} fields={fields} eventDateIso={eventDateIso} locale={contentLocale} photoUrl={photoUrl} /></InvitationCanvas></span>
          <span>{templateCardTitle(template.id, ui.printsTab)}</span>
        </button>)}</div></details>
        <InvitationPreflight fields={fields} locale={uiLocale} templateId={activeId} targetId="invitation-editor-proof" />
      </div>
    </div>
  </section>;
}
