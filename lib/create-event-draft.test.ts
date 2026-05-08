import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CREATE_EVENT_DRAFT_KEY,
  clearCreateEventDraftFromStorage,
  type CreateEventDraft,
  decodeCreateEventDraft,
  encodeCreateEventDraft,
  readCreateEventDraftFromStorage,
  writeCreateEventDraftToStorage,
} from "./create-event-draft";

describe("create-event draft", () => {
  it("roundtrips via encode/decode", () => {
    const draft: CreateEventDraft = {
      v: 1,
      savedAt: "2026-05-08T12:00:00.000Z",
      step: "2",
      name: "My Event",
      emoji: "💍",
      date: "2026-05-08",
      planId: "plus",
    };
    const encoded = encodeCreateEventDraft(draft);
    const decoded = decodeCreateEventDraft(encoded);
    expect(decoded).toEqual(draft);
  });

  it("rejects invalid payloads", () => {
    expect(decodeCreateEventDraft("{not json")).toBeNull();
    expect(decodeCreateEventDraft(JSON.stringify({ v: 999 }))).toBeNull();
  });

  it("exports stable localStorage key", () => {
    expect(CREATE_EVENT_DRAFT_KEY).toBe("calisto_create_event_draft_v1");
  });
});

function memoryLocalStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

describe("create-event draft storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: memoryLocalStorage() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("write then read returns decoded draft with v and savedAt", () => {
    const before = Date.now();
    writeCreateEventDraftToStorage({
      step: "3",
      name: "Gala",
      emoji: "🎉",
      date: "2026-07-01",
      planId: "free",
    });
    const after = Date.now();

    const read = readCreateEventDraftFromStorage();
    expect(read).not.toBeNull();
    expect(read!.v).toBe(1);
    expect(read!.step).toBe("3");
    expect(read!.name).toBe("Gala");
    expect(read!.emoji).toBe("🎉");
    expect(read!.date).toBe("2026-07-01");
    expect(read!.planId).toBe("free");
    expect(read!.savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    const ts = Date.parse(read!.savedAt);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("clear removes the draft", () => {
    writeCreateEventDraftToStorage({
      step: "1",
      name: "X",
      date: "2026-01-01",
      planId: "max",
    });
    expect(readCreateEventDraftFromStorage()).not.toBeNull();
    clearCreateEventDraftFromStorage();
    expect(readCreateEventDraftFromStorage()).toBeNull();
    expect(window.localStorage.getItem(CREATE_EVENT_DRAFT_KEY)).toBeNull();
  });
});
