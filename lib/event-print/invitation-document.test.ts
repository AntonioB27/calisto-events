import { describe, expect, it } from 'vitest';
import { INVITATION_DOCUMENT_ID, mergeInvitationDocuments, validateInvitationDocument, invitationFormat } from './invitation-document';
import { invitationCapabilities } from './invitation-capabilities';
const names = { partner_a: ' Ana ', partner_b: 'Luka' };
describe('canonical invitation documents', () => {
  it('reads legacy fields across designs without losing photo data', () => {
    expect(mergeInvitationDocuments({ [INVITATION_DOCUMENT_ID]: { partner_a: 'Ana' }, 'wedding-invite-gold-circles-photo': { partner_a: 'old', couple_photo_path: 'event/invite-photo/a.jpg' } })).toEqual({ partner_a: 'Ana', couple_photo_path: 'event/invite-photo/a.jpg' });
  });
  it('never resurrects cleared canonical fields from an old template', () => {
    expect(mergeInvitationDocuments({ [INVITATION_DOCUMENT_ID]: { _invitation_version: '2', partner_a: 'Ana' }, 'wedding-invite-gold-circles-photo': { couple_photo_path: 'old' } })).toEqual({ _invitation_version: '2', partner_a: 'Ana' });
  });
  it('preserves every design field and print configuration in one record', () => {
    const result = validateInvitationDocument({ ...names, church_address: 'Ceremony', couple_photo_path: 'event/invite-photo/a.jpg', selected_template: 'wedding-invite-gold-circles-photo', font_scale: '125', print_format: '5x7', print_bleed: '3', content_locale: 'de', show_quote: '0' }, 'event');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.values).toMatchObject({ partner_a: 'Ana', church_address: 'Ceremony', couple_photo_path: 'event/invite-photo/a.jpg', font_scale: '125', print_format: '5x7', content_locale: 'de', _invitation_version: '2', show_quote: '0' });
  });
  it.each([{ font_scale: 'Infinity' }, { font_scale: '151' }, { font_scale: null }, { couple_photo_crop_scale: '0' }, { couple_photo_path: 'another/invite-photo/a.jpg' }, { couple_photo_path: 'event/invite-photo/../a.jpg' }, { content_locale: 'xx' }, { selected_template: 'table-minimal' }, { print_bleed: '20' }])('rejects invalid geometry and unsafe fields %j', bad => {
    expect(validateInvitationDocument({ ...names, ...bad }, 'event').ok).toBe(false);
  });
  it('uses exact physical trim sizes', () => {
    expect(invitationFormat({ print_format: 'a5' })).toMatchObject({ width: 148, height: 210 });
    expect(invitationFormat({ print_format: '5x7' })).toMatchObject({ width: 127, height: 177.8 });
  });

  it('retains schedule data while clearly marking it unsupported by the glitter design', () => {
    const supported = invitationCapabilities('wedding-invite-grayscale-glitter').fields.map(field => field.key);
    expect(supported).not.toContain('church_address');
    expect(supported).not.toContain('quote_text');
  });
});
