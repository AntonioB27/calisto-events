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
    id: "wedding-invite-simple",
    category: "invitation",
    eventKinds: ["wedding"],
    fields: [
      { key: "partner_a", maxLength: 80, required: true },
      { key: "partner_b", maxLength: 80, required: true },
      { key: "venue", maxLength: 240, required: false },
      { key: "extra_line", maxLength: 120, required: false },
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
