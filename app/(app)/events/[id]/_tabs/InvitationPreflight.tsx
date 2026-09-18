"use client";
import { useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { invitationFormat } from '@/lib/event-print/invitation-document';
import { invitationWorkspaceCopy } from '@/lib/event-print/invitation-workspace-copy';

export function InvitationPreflight({ fields, locale, templateId, targetId }: { fields: Record<string, string>; locale: Locale; templateId: string; targetId: string }) {
  const copy = invitationWorkspaceCopy(locale);
  const [overflow, setOverflow] = useState(false);
  const [lowResolution, setLowResolution] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const root = document.getElementById(targetId);
    if (!root) return;
    function check() {
      if (cancelled) return;
      const trim = root!.querySelector<HTMLElement>('.invitation-canvas__trim');
      const card = trim?.querySelector<HTMLElement>('[data-template]');
      if (!trim || !card) return;
      const bounds = trim.getBoundingClientRect();
      if (!bounds.width) return;
      const texts = [...card.querySelectorAll<HTMLElement>('p, h1, h2, h3')].filter(el => el.textContent?.trim());
      const safe = bounds.width * 5 / invitationFormat(fields).width;
      const outside = texts.some(el => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.left < bounds.left + safe || r.right > bounds.right - safe || r.top < bounds.top + safe || r.bottom > bounds.bottom - safe || el.scrollWidth > el.clientWidth + 2);
      });
      setOverflow(outside || card.scrollHeight > card.clientHeight + 2);
      const photo = card.querySelector<HTMLImageElement>('img');
      const format = invitationFormat(fields);
      const photoWidthMm = 210 * .72 * Math.max(format.width / 210, format.height / 297) * Number(fields.couple_photo_crop_scale || 1);
      setLowResolution(!!photo?.naturalWidth && Math.min(photo.naturalWidth, photo.naturalHeight) / (photoWidthMm / 25.4) < 300);
    }
    void document.fonts.ready.then(check);
    root.addEventListener('load', check, true);
    const observer = new ResizeObserver(check); observer.observe(root);
    const timer = window.setTimeout(check, 200);
    return () => { cancelled = true; root.removeEventListener('load', check, true); observer.disconnect(); window.clearTimeout(timer); };
  }, [fields, targetId, templateId]);
  return <div className="invitation-workspace__preflight print:hidden">
    <h3>{copy.readiness}</h3>
    {overflow && <p role="status">{copy.overflow}</p>}
    {templateId !== 'wedding-invite-gold-circles-photo' && <p>{copy.artworkWarning}</p>}
    {lowResolution && <p>{copy.photoResolution}</p>}
    <p>{copy.bleedHint}</p><p>{copy.productionHint}</p>
  </div>;
}
