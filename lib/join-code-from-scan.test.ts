import { describe, expect, it } from "vitest";

import { decodeJoinCodeFromScan } from "./join-code-from-scan";

describe("decodeJoinCodeFromScan", () => {
  it("accepts a bare valid code", () => {
    expect(decodeJoinCodeFromScan("  wedding2026  ")).toBe("WEDDING2026");
  });

  it("extracts code from absolute join URL", () => {
    expect(decodeJoinCodeFromScan("https://calisto.example.com/join/ABC12345")).toBe("ABC12345");
  });

  it("extracts code from join URL with encoded segment", () => {
    expect(decodeJoinCodeFromScan("https://x.com/join/WEDDING2026")).toBe("WEDDING2026");
  });

  it("extracts code from URL without scheme", () => {
    expect(decodeJoinCodeFromScan("calisto.example.com/join/MYPARTY1")).toBe("MYPARTY1");
  });

  it("extracts code from path fragment in longer text", () => {
    expect(decodeJoinCodeFromScan("Open https://a.b/join/HELLO999 ok")).toBe("HELLO999");
  });

  it("strips CALISTO- prefix in path segment when suffix is valid", () => {
    expect(decodeJoinCodeFromScan("https://x.com/join/CALISTO-S2UAQ4")).toBe("S2UAQ4");
  });

  it("returns null for invalid payloads", () => {
    expect(decodeJoinCodeFromScan("")).toBeNull();
    expect(decodeJoinCodeFromScan("nope")).toBeNull();
    expect(decodeJoinCodeFromScan("https://x.com/other/ABC12345")).toBeNull();
  });
});
