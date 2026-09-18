"use client";
import { useRef, useState } from 'react';
import { invitationWorkspaceCopy } from '@/lib/event-print/invitation-workspace-copy';
import type { Locale } from '@/lib/i18n';

type Props = {
  eventId: string; fields: Record<string, string>; photoUrl: string | null; locale: Locale;
  disabled: boolean; onChange: (fields: Record<string, string>) => void;
  onBusy: (busy: boolean) => void; onPhoto: (url: string | null) => void;
};
export function InvitePhotoUpload({ eventId, fields, photoUrl, locale, disabled, onChange, onBusy, onPhoto }: Props) {
  const copy = invitationWorkspaceCopy(locale);
  const [error, setError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);
  const x = Number(fields.couple_photo_crop_x || 0);
  const y = Number(fields.couple_photo_crop_y || 0);
  const scale = Math.max(1, Number(fields.couple_photo_crop_scale || 1));
  const limit = (scale - 1) * 100;
  function crop(nx: number, ny: number, ns = scale) {
    const bound = (ns - 1) * 100;
    onChange({ couple_photo_crop_x: String(Math.max(-bound, Math.min(bound, nx))), couple_photo_crop_y: String(Math.max(-bound, Math.min(bound, ny))), couple_photo_crop_scale: String(ns) });
  }
  async function upload(file: File) {
    setError(false); setUploading(true); onBusy(true);
    try {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('file');
      // Decode before upload so a corrupt image never replaces the saved photo.
      const bitmap = await createImageBitmap(file); bitmap.close();
      const data = new FormData(); data.append('file', file);
      const response = await fetch(`/api/events/${eventId}/invite-photo-upload`, { method: 'POST', body: data });
      const result = await response.json();
      if (!response.ok || !result.path) throw new Error('upload');
      // Commit path and crop together, only after success. Signing is owned by
      // the workspace; no object URL can outlive its component or be printed.
      onPhoto(null);
      onChange({ couple_photo_path: result.path, couple_photo_crop_x: '0', couple_photo_crop_y: '0', couple_photo_crop_scale: '1' });
    } catch { setError(true); }
    finally { setUploading(false); onBusy(false); }
  }
  return <div className="invitation-photo">
    {photoUrl && <div className="invitation-photo__crop"
      onPointerDown={e => { if (disabled || uploading) return; e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, cx: x, cy: y }; }}
      onPointerMove={e => { if (!drag.current) return; const d = drag.current; const ratio = 200 / e.currentTarget.clientWidth; crop(d.cx + (e.clientX - d.x) * ratio, d.cy + (e.clientY - d.y) * ratio); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt="" draggable={false} style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, transform: `translate(calc(-50% + ${x / (2 * scale)}%), calc(-50% + ${y / (2 * scale)}%))` }} />
    </div>}
    <p>{copy.cropHint}</p>
    {photoUrl && <>
      <label>{copy.zoom}<input type="range" min="1" max="5" step="0.05" value={scale} disabled={disabled || uploading} onChange={e => crop(x, y, Number(e.target.value))} /></label>
      <label>{copy.horizontal}<input type="range" min={-limit} max={limit} step="1" value={x} disabled={disabled || uploading || limit === 0} onChange={e => crop(Number(e.target.value), y)} /></label>
      <label>{copy.vertical}<input type="range" min={-limit} max={limit} step="1" value={y} disabled={disabled || uploading || limit === 0} onChange={e => crop(x, Number(e.target.value))} /></label>
      <div className="invitation-workspace__actions"><button type="button" disabled={disabled || uploading} onClick={() => crop(0, 0, 1)}>{copy.reset}</button><button type="button" disabled={disabled || uploading} onClick={() => { onChange({ couple_photo_path: '', couple_photo_crop_x: '0', couple_photo_crop_y: '0', couple_photo_crop_scale: '1' }); onPhoto(null); }}>{copy.remove}</button></div>
    </>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (file) void upload(file); }} />
    <button type="button" disabled={disabled || uploading} onClick={() => input.current?.click()}>{uploading ? copy.saving : photoUrl ? (locale === 'hr' ? 'Promijeni fotografiju' : locale === 'de' ? 'Foto ändern' : 'Change photo') : (locale === 'hr' ? 'Dodaj fotografiju' : locale === 'de' ? 'Foto hinzufügen' : 'Add photo')}</button>
    <p>{copy.photoHint}</p>{error && <p role="alert">{copy.uploadFail}</p>}
  </div>;
}
