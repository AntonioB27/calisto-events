import type { InvitationVisibilityKey } from './invitation-field-visibility';
import { getPrintTemplateDef } from './template-catalog';
const visible: Record<string, InvitationVisibilityKey[]> = {
  'wedding-invite-blue-floral': ['invite_preamble', 'partner_names', 'event_date', 'extra_line'],
  'wedding-invite-geometric': ['invite_preamble', 'partner_names', 'event_date', 'extra_line', 'reception'],
  'wedding-invite-watercolor-coast': ['church', 'venue', 'venue_line_2', 'extra_line', 'event_date', 'invite_preamble', 'partner_names', 'reception'],
  'wedding-invite-navy-botanical': ['together_families', 'invite_preamble', 'partner_names', 'event_date', 'extra_line'],
  'wedding-invite-grayscale-glitter': ['event_date', 'extra_line', 'together_families', 'partner_names', 'cordially_invite', 'wedding_title'],
  'wedding-invite-terra-pill': ['event_date', 'invite_preamble', 'wedding_title', 'partner_names'],
  'wedding-invite-gold-arch-floral': ['event_date', 'extra_line', 'partner_names', 'cordially_invite'],
  'wedding-invite-cherry-blossom': ['event_date', 'invite_preamble', 'partner_names'],
  'wedding-invite-olive-gold-frame': ['event_date', 'extra_line', 'invite_preamble', 'cordially_invite', 'partner_names'],
  'wedding-invite-gold-circles-photo': ['event_date', 'invite_preamble', 'partner_names', 'venue', 'extra_line', 'reception'],
};
export function invitationCapabilities(id: string) {
  const details = !['wedding-invite-grayscale-glitter', 'wedding-invite-gold-circles-photo'].includes(id);
  const visibility = [...new Set([...(visible[id] ?? []), ...(details ? ['gathering', 'church', 'dinner', 'quote'] as const : [])])];
  const detailFieldKeys = new Set([
    'gathering_type', 'gathering_address', 'gathering_time',
    'partner_a_gathering_address', 'partner_a_gathering_time',
    'partner_b_gathering_address', 'partner_b_gathering_time',
    'church_address', 'church_time', 'dinner_address', 'dinner_time',
    'quote_text', 'quote_author',
  ]);
  const keys = (getPrintTemplateDef(id)?.fields ?? []).filter(f => {
    if (!details && detailFieldKeys.has(f.key)) return false;
    if (f.key === 'venue') return visibility.includes('venue');
    if (f.key === 'venue_line_2') return visibility.includes('venue_line_2');
    return true;
  });
  return { details, visibility, fields: keys, photo: id === 'wedding-invite-gold-circles-photo' };
}
