import { describe, expect, it } from "vitest";

import {
  isInvitationPrintTemplateId,
  isTableQrTemplateId,
  listPrintTemplatesForEventKind,
} from "./template-catalog";
import { validatePrintTemplateFieldValues } from "./validate-print-template-fields";

describe("template-catalog", () => {
  it("lists wedding templates including invitation", () => {
    const ids = listPrintTemplatesForEventKind("wedding").map((t) => t.id);
    expect(ids).toContain("wedding-invite-simple");
    expect(ids).toContain("table-minimal");
  });

  it("lists generic without wedding-only invitation", () => {
    const ids = listPrintTemplatesForEventKind("generic").map((t) => t.id);
    expect(ids).not.toContain("wedding-invite-simple");
    expect(ids).toContain("table-bold");
  });

  it("classifies template ids", () => {
    expect(isInvitationPrintTemplateId("wedding-invite-simple")).toBe(true);
    expect(isInvitationPrintTemplateId("table-minimal")).toBe(false);
    expect(isTableQrTemplateId("table-bold")).toBe(true);
    expect(isTableQrTemplateId("wedding-invite-simple")).toBe(false);
  });
});

describe("validatePrintTemplateFieldValues", () => {
  it("accepts empty object for table template", () => {
    const r = validatePrintTemplateFieldValues("table-minimal", {});
    expect(r).toEqual({ ok: true, values: {} });
  });

  it("rejects unknown template", () => {
    const r = validatePrintTemplateFieldValues("nope", {});
    expect(r.ok).toBe(false);
  });

  it("validates wedding invitation fields", () => {
    expect(
      validatePrintTemplateFieldValues("wedding-invite-simple", {
        partner_a: "A",
        partner_b: "B",
      }).ok,
    ).toBe(true);

    expect(validatePrintTemplateFieldValues("wedding-invite-simple", { partner_a: "A" }).ok).toBe(false);

    expect(
      validatePrintTemplateFieldValues("wedding-invite-simple", {
        partner_a: "A",
        partner_b: "B",
        venue: "x".repeat(300),
      }).ok,
    ).toBe(false);
  });
});
