import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { scheduleAutoHide, UPLOAD_DONE_HIDE_MS, UPLOAD_FADE_MS, uploadPillPhase, type UploadStatus } from "./upload-pill";

const q = (...s: UploadStatus[]) => s.map((status) => ({ status }));

describe("uploadPillPhase", () => {
  it("follows the queue", () => {
    expect(uploadPillPhase([])).toBe("hidden");
    expect(uploadPillPhase(q("done", "pending", "error"))).toBe("uploading");
    expect(uploadPillPhase(q("done", "error"))).toBe("failed");
    expect(uploadPillPhase(q("done", "done"))).toBe("done");
  });
});

describe("scheduleAutoHide", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("fades, then clears, a few seconds after everything succeeded", () => {
    const fade = vi.fn();
    const clear = vi.fn();
    scheduleAutoHide("done", false, fade, clear);
    vi.advanceTimersByTime(UPLOAD_DONE_HIDE_MS - 1);
    expect(fade).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fade).toHaveBeenCalledOnce();
    expect(clear).not.toHaveBeenCalled();
    vi.advanceTimersByTime(UPLOAD_FADE_MS);
    expect(clear).toHaveBeenCalledOnce();
  });

  it("keeps failures, running uploads and an open list on screen", () => {
    const clear = vi.fn();
    expect(scheduleAutoHide("failed", false, clear, clear)).toBeUndefined();
    expect(scheduleAutoHide("uploading", false, clear, clear)).toBeUndefined();
    expect(scheduleAutoHide("done", true, clear, clear)).toBeUndefined();
    vi.advanceTimersByTime(60_000);
    expect(clear).not.toHaveBeenCalled();
  });

  it("cancels when new uploads arrive before it hides", () => {
    const clear = vi.fn();
    const cancel = scheduleAutoHide("done", false, clear, clear);
    vi.advanceTimersByTime(1000);
    cancel?.();
    vi.advanceTimersByTime(60_000);
    expect(clear).not.toHaveBeenCalled();
  });
});
