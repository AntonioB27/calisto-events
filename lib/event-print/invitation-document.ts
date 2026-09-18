import { listPrintTemplatesForEventKind, isInvitationPrintTemplateId } from './template-catalog';
import { validatePrintTemplateFieldValues } from './validate-print-template-fields';

// The existing blue-floral row is the canonical document, avoiding a database
// migration while keeping legacy drafts readable. All designs render this data.
export const INVITATION_DOCUMENT_ID = 'wedding-invite-blue-floral';
export const INVITATION_FORMATS = {
  a5: { width: 148, height: 210, label: 'A5 · 148 × 210 mm' },
  '5x7': { width: 127, height: 177.8, label: '5 × 7 in · 127 × 177.8 mm' },
} as const;
export function invitationFormat(fields: Record<string, string>) {
  return INVITATION_FORMATS[fields.print_format === '5x7' ? '5x7' : 'a5'];
}
export function mergeInvitationDocuments(drafts: Readonly<Record<string, Record<string, string>>>) {
  const canonical = drafts[INVITATION_DOCUMENT_ID];
  if (canonical?._invitation_version === '2') return { ...canonical };
  const fields: Record<string, string> = {};
  for (const template of listPrintTemplatesForEventKind('wedding')) {
    if (template.category !== 'invitation') continue;
    for (const [key, value] of Object.entries(drafts[template.id] ?? {})) {
      if (!(key in fields)) fields[key] = value;
    }
  }
  return fields;
}
export function validateInvitationDocument(raw: Record<string, unknown>, eventId: string) {
  const values: Record<string, string> = {};
  for (const template of listPrintTemplatesForEventKind('wedding').filter(t => t.category === 'invitation')) {
    const result = validatePrintTemplateFieldValues(template.id, raw);
    if (!result.ok) return result;
    Object.assign(values, result.values);
  }
  const choices: Record<string, readonly string[]> = {
    selected_template: listPrintTemplatesForEventKind('wedding').filter(t => t.category === 'invitation').map(t => t.id),
    print_format: ['a5', '5x7'], print_bleed: ['0', '3'], content_locale: ['en', 'hr', 'de'],
    connector_symbol: ['ampersand', 'heart', 'infinity'], gathering_type: ['', 'same', 'separate'],
  };
  for (const [key, options] of Object.entries(choices)) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] !== 'string' || !options.includes(raw[key] as string)) return { ok: false as const, error: `Invalid field: ${key}` };
    values[key] = raw[key] as string;
  }
  for (const [key, min, max] of [ ['font_scale', 70, 150], ['couple_photo_crop_x', -400, 400], ['couple_photo_crop_y', -400, 400], ['couple_photo_crop_scale', 1, 5] ] as const) {
    if (raw[key] === undefined || raw[key] === '') continue;
    const n = Number(raw[key]);
    if (typeof raw[key] !== 'string' || !Number.isFinite(n) || n < min || n > max) return { ok: false as const, error: `Invalid field: ${key}` };
    values[key] = String(n);
  }
  const photoPath = values.couple_photo_path;
  if (photoPath && (!photoPath.startsWith(`${eventId}/invite-photo/`) || photoPath.includes('..'))) return { ok: false as const, error: 'Invalid photo path.' };
  values._invitation_version = '2';
  return { ok: true as const, values };
}
export function selectedInvitation(fields: Record<string, string>) {
  return isInvitationPrintTemplateId(fields.selected_template ?? '') ? fields.selected_template : INVITATION_DOCUMENT_ID;
}
