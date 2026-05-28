import { getPrintTemplateDef } from "./template-catalog";

export type ValidatePrintFieldValuesResult =
  | { ok: true; values: Record<string, string> }
  | { ok: false; error: string };

/**
 * Validates `raw` keys against the template catalog and enforces maxLength / required.
 * Unknown keys are dropped. Values are trimmed strings.
 */
export function validatePrintTemplateFieldValues(
  templateId: string,
  raw: Record<string, unknown> | null | undefined,
): ValidatePrintFieldValuesResult {
  const def = getPrintTemplateDef(templateId);
  if (!def) {
    return { ok: false, error: "Unknown template." };
  }

  const src = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  const out: Record<string, string> = {};

  for (const field of def.fields) {
    const v = src[field.key];
    const str = typeof v === "string" ? v.trim() : "";
    if (!str) {
      if (field.required) {
        return { ok: false, error: `Missing field: ${field.key}` };
      }
      continue;
    }
    if (str.length > field.maxLength) {
      return { ok: false, error: `Field ${field.key} is too long.` };
    }
    out[field.key] = str;
  }

  return { ok: true, values: out };
}
