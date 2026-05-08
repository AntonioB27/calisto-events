import { describe, expect, it } from "vitest";

import { getSafeReturnPath } from "./safe-return-path";

describe("getSafeReturnPath", () => {
  it("accepts same-origin relative paths", () => {
    expect(getSafeReturnPath("/join/ABC")).toBe("/join/ABC");
  });

  it("rejects protocol-relative URLs", () => {
    expect(getSafeReturnPath("//evil.com")).toBeNull();
  });

  it("rejects empty or non-relative values", () => {
    expect(getSafeReturnPath("")).toBeNull();
    expect(getSafeReturnPath(null)).toBeNull();
    expect(getSafeReturnPath("https://x.com")).toBeNull();
  });
});
