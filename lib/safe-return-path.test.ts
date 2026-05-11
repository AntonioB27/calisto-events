import { describe, expect, it } from "vitest";

import { getPostAuthRedirectPath, getSafeReturnPath } from "./safe-return-path";

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

describe("getPostAuthRedirectPath", () => {
  it("defaults to dashboard when missing, invalid, or root", () => {
    expect(getPostAuthRedirectPath(null)).toBe("/dashboard");
    expect(getPostAuthRedirectPath("")).toBe("/dashboard");
    expect(getPostAuthRedirectPath("//evil")).toBe("/dashboard");
    expect(getPostAuthRedirectPath("/")).toBe("/dashboard");
  });

  it("preserves safe deep paths", () => {
    expect(getPostAuthRedirectPath("/join/ABC")).toBe("/join/ABC");
    expect(getPostAuthRedirectPath("/events/new?resume=1")).toBe("/events/new?resume=1");
  });
});
