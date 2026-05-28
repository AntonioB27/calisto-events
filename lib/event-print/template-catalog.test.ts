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
    expect(ids).toContain("wedding-invite-blue-floral");
    expect(ids).toContain("table-minimal");
  });

  it("lists generic without wedding-only invitation", () => {
    const ids = listPrintTemplatesForEventKind("generic").map((t) => t.id);
    expect(ids).not.toContain("wedding-invite-blue-floral");
    expect(ids).toContain("table-bold");
  });

  it("classifies template ids", () => {
    expect(isInvitationPrintTemplateId("wedding-invite-blue-floral")).toBe(true);
    expect(isInvitationPrintTemplateId("table-minimal")).toBe(false);
    expect(isTableQrTemplateId("table-bold")).toBe(true);
    expect(isTableQrTemplateId("wedding-invite-blue-floral")).toBe(false);
  });

  it("lists gold-circles-photo template for wedding events", () => {
    const ids = listPrintTemplatesForEventKind("wedding").map((t) => t.id);
    expect(ids).toContain("wedding-invite-gold-circles-photo");
  });

  it("classifies gold-circles-photo as invitation", () => {
    expect(isInvitationPrintTemplateId("wedding-invite-gold-circles-photo")).toBe(true);
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
      validatePrintTemplateFieldValues("wedding-invite-blue-floral", {
        partner_a: "A",
        partner_b: "B",
      }).ok,
    ).toBe(true);

    expect(
      validatePrintTemplateFieldValues("wedding-invite-blue-floral", { partner_a: "A" }).ok,
    ).toBe(false);

    expect(
      validatePrintTemplateFieldValues("wedding-invite-blue-floral", {
        partner_a: "A",
        partner_b: "B",
        venue: "x".repeat(300),
      }).ok,
    ).toBe(false);
  });

  it("validates gold-circles-photo with partner names and photo path", () => {
    const result = validatePrintTemplateFieldValues("wedding-invite-gold-circles-photo", {
      partner_a: "Sofia",
      partner_b: "Tarun",
      couple_photo_path: "abc123/invite-photo/img.jpg",
      couple_photo_crop_x: "0",
      couple_photo_crop_y: "0",
      couple_photo_crop_scale: "1",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects gold-circles-photo missing required partner_b", () => {
    const result = validatePrintTemplateFieldValues("wedding-invite-gold-circles-photo", {
      partner_a: "Sofia",
    });
    expect(result.ok).toBe(false);
  });
});
