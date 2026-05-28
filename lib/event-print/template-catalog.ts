import type { EventKind } from "@/lib/event-kind";

export type PrintTemplateCategory = "invitation" | "table_qr";

export type PrintTemplateFieldDef = Readonly<{
  key: string;
  maxLength: number;
  required: boolean;
  /** When set, UI may pre-fill from the event row (ISO date string for event_date). */
  defaultFromEvent?: "title" | "event_date";
}>;

export type PrintTemplateDef = Readonly<{
  id: string;
  category: PrintTemplateCategory;
  /** Event kinds that list this template in the Prints catalog. */
  eventKinds: readonly EventKind[];
  fields: readonly PrintTemplateFieldDef[];
  /** Optional env key for Stripe Price id; null = not sold via Stripe yet. */
  stripePriceEnvKey: string | null;
}>;

/** Table/QR layouts shipped today (data still comes from the event row in `PosterHalfCard`). */
export const TABLE_QR_PRINT_TEMPLATE_IDS = ["table-minimal", "table-bold"] as const;
export type TableQrPrintTemplateId = (typeof TABLE_QR_PRINT_TEMPLATE_IDS)[number];

/** Invitation layouts (field values + optional QR block on the print route). */
export const INVITATION_PRINT_TEMPLATE_IDS = [
  "wedding-invite-blue-floral",
  "wedding-invite-geometric",
  "wedding-invite-watercolor-coast",
  "wedding-invite-navy-botanical",
  "wedding-invite-grayscale-glitter",
  "wedding-invite-terra-pill",
  "wedding-invite-gold-arch-floral",
  "wedding-invite-cherry-blossom",
  "wedding-invite-olive-gold-frame",
  "wedding-invite-gold-circles-photo",
] as const;
export type InvitationPrintTemplateId = (typeof INVITATION_PRINT_TEMPLATE_IDS)[number];

export const PRINT_TEMPLATE_DEFINITIONS: readonly PrintTemplateDef[] = [
  {
    id: "table-minimal",
    category: "table_qr",
    eventKinds: ["generic", "wedding"],
    fields: [],
    stripePriceEnvKey: null,
  },
  {
    id: "table-bold",
    category: "table_qr",
    eventKinds: ["generic", "wedding"],
    fields: [],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-blue-floral",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-geometric",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-watercolor-coast",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-navy-botanical",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-grayscale-glitter",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-terra-pill",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-gold-arch-floral",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-cherry-blossom",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-olive-gold-frame",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "connector_symbol", maxLength: 20, required: false },
      { key: "gathering_type", maxLength: 20, required: false },
      { key: "gathering_address", maxLength: 200, required: false },
      { key: "gathering_time", maxLength: 80, required: false },
      { key: "partner_a_gathering_address", maxLength: 200, required: false },
      { key: "partner_a_gathering_time", maxLength: 80, required: false },
      { key: "partner_b_gathering_address", maxLength: 200, required: false },
      { key: "partner_b_gathering_time", maxLength: 80, required: false },
      { key: "church_address", maxLength: 200, required: false },
      { key: "church_time", maxLength: 80, required: false },
      { key: "dinner_address", maxLength: 200, required: false },
      { key: "dinner_time", maxLength: 80, required: false },
      { key: "quote_text", maxLength: 300, required: false },
      { key: "quote_author", maxLength: 120, required: false },
      { key: "venue", maxLength: 200, required: false },
      { key: "venue_line_2", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
    ],
    stripePriceEnvKey: null,
  },
  {
    id: "wedding-invite-gold-circles-photo",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "venue", maxLength: 200, required: false },
      { key: "extra_line", maxLength: 120, required: false },
      { key: "couple_photo_path", maxLength: 500, required: false },
      { key: "couple_photo_crop_x", maxLength: 30, required: false },
      { key: "couple_photo_crop_y", maxLength: 30, required: false },
      { key: "couple_photo_crop_scale", maxLength: 30, required: false },
    ],
    stripePriceEnvKey: null,
  },
] as const;

const byId = new Map(PRINT_TEMPLATE_DEFINITIONS.map((d) => [d.id, d]));

export function getPrintTemplateDef(templateId: string): PrintTemplateDef | undefined {
  return byId.get(templateId);
}

export function listPrintTemplatesForEventKind(kind: EventKind): readonly PrintTemplateDef[] {
  return PRINT_TEMPLATE_DEFINITIONS.filter((d) => d.eventKinds.includes(kind));
}

export function isKnownPrintTemplateId(templateId: string): boolean {
  return byId.has(templateId);
}

export function isTableQrTemplateId(id: string): id is TableQrPrintTemplateId {
  return (TABLE_QR_PRINT_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function isInvitationPrintTemplateId(id: string): id is InvitationPrintTemplateId {
  return (INVITATION_PRINT_TEMPLATE_IDS as readonly string[]).includes(id);
}
