import { describe, expect, it } from "vitest";
import { getStartPageCopy } from "./i18n-start";

const LOCALES = ["en", "hr", "de"] as const;
const PLAN_KEYS = ["free", "standard", "plus", "premium", "max"] as const;

describe("getStartPageCopy", () => {
  for (const locale of LOCALES) {
    describe(locale, () => {
      const copy = getStartPageCopy(locale);

      it("has hero copy", () => {
        expect(copy.heroLine1).toBeTruthy();
        expect(copy.heroLine2).toBeTruthy();
        expect(copy.heroSub).toBeTruthy();
      });

      it("has 4 features", () => {
        expect(copy.features).toHaveLength(4);
      });

      it("has 3 howSteps each with title and desc", () => {
        expect(copy.howSteps).toHaveLength(3);
        for (const step of copy.howSteps) {
          expect(step.title).toBeTruthy();
          expect(step.desc).toBeTruthy();
        }
      });

      it("has guestLimits for all plans", () => {
        for (const k of PLAN_KEYS) {
          expect(copy.guestLimits[k]).toBeTruthy();
        }
      });

      it("has planDescriptions for all plans", () => {
        for (const k of PLAN_KEYS) {
          expect(copy.planDescriptions[k]).toBeTruthy();
        }
      });

      it("has formCta without em dash", () => {
        expect(copy.formCta).toBeTruthy();
        expect(copy.formCta).not.toContain("—");
      });

      it("has 3 reviews each with quote, name and event", () => {
        expect(copy.reviews).toHaveLength(3);
        for (const review of copy.reviews) {
          expect(review.quote).toBeTruthy();
          expect(review.name).toBeTruthy();
          expect(review.event).toBeTruthy();
        }
      });
    });
  }
});
