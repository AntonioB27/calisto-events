import { describe, expect, it } from "vitest";

import { filledPrints, formatZipSize, maskEmail, timeLeft, zipMinutesLeft, zipPercent, zipPhase, type ZipJob } from "./zip-export-view";

const NOW = Date.parse("2026-11-23T12:00:00Z");
const job = (over: Partial<ZipJob>): ZipJob => ({
  id: "j",
  status: "running",
  include_videos: true,
  error_message: null,
  expires_at: null,
  created_at: "2026-11-23T11:58:00Z",
  file_size_bytes: null,
  progress_done: 0,
  progress_total: null,
  ...over,
});

describe("zipPhase", () => {
  it("maps each status to what the dock shows", () => {
    expect(zipPhase(null, NOW)).toBeNull();
    expect(zipPhase(job({ status: "queued" }), NOW)).toBe("queued");
    expect(zipPhase(job({ progress_done: 40, progress_total: 248 }), NOW)).toBe("packing");
    expect(zipPhase(job({ progress_done: 248, progress_total: 248 }), NOW)).toBe("saving");
    expect(zipPhase(job({ status: "ready", expires_at: "2026-11-24T12:00:00Z" }), NOW)).toBe("ready");
    expect(zipPhase(job({ status: "expired" }), NOW)).toBeNull();
  });

  it("hides a ready ZIP past its expiry and a failure older than a day", () => {
    expect(zipPhase(job({ status: "ready", expires_at: "2026-11-23T11:00:00Z" }), NOW)).toBeNull();
    expect(zipPhase(job({ status: "failed", created_at: "2026-11-23T10:00:00Z" }), NOW)).toBe("failed");
    expect(zipPhase(job({ status: "failed", created_at: "2026-11-21T10:00:00Z" }), NOW)).toBeNull();
  });
});

describe("progress numbers", () => {
  it("never shows 100% before the file is saved", () => {
    expect(zipPercent("packing", 248, 248)).toBe(98);
    expect(zipPercent("saving", 248, 248)).toBe(99);
    expect(zipPercent("ready", 0, 0)).toBe(100);
    expect(zipPercent("packing", 104, 248)).toBe(41);
    expect(zipPercent("queued", 0, 0)).toBe(0);
  });

  it("fills prints by percentage and all of them only when ready", () => {
    expect(filledPrints("packing", 41, 8)).toBe(3);
    expect(filledPrints("saving", 99, 8)).toBe(7);
    expect(filledPrints("ready", 100, 8)).toBe(8);
  });

  it("estimates minutes left from the observed rate", () => {
    expect(zipMinutesLeft({ at: NOW - 1000, done: 0 }, NOW, 10, 100)).toBeNull();
    // 50 files in 60 s, 150 left → 3 min
    expect(zipMinutesLeft({ at: NOW - 60_000, done: 50 }, NOW, 100, 250)).toBe(3);
  });

  it("formats sizes", () => {
    expect(formatZipSize(702_804_139, "en")).toBe("703 MB");
    expect(formatZipSize(1_678_570_221, "en")).toBe("1.7 GB");
  });
});

describe("status page helpers", () => {
  it("masks the e-mail but keeps the domain", () => {
    expect(maskEmail("antonio@gmail.com")).toBe("a•••@gmail.com");
    expect(maskEmail("broken")).toBe("broken");
  });

  it("counts hours and minutes left, never below zero", () => {
    expect(timeLeft(NOW + (23 * 60 + 41) * 60_000, NOW)).toEqual({ h: 23, m: 41 });
    expect(timeLeft(NOW - 1000, NOW)).toEqual({ h: 0, m: 0 });
  });
});
