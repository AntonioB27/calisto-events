import { describe, expect, it } from "vitest";

import { wouldExceedMediaLimit } from "./zip-export-eligibility";

describe("wouldExceedMediaLimit", () => {
  it("returns false at boundary", () => {
    expect(wouldExceedMediaLimit(2000, 2000)).toBe(false);
  });

  it("returns true over boundary", () => {
    expect(wouldExceedMediaLimit(2001, 2000)).toBe(true);
  });
});
