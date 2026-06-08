import { beforeEach, describe, expect, it, vi } from "vitest";
import { __test, POST } from "./route";

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "organizer_1" } },
      }),
    },
  }),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({}),
}));

const checkOrganizerMock = vi.fn<
  (eventId: string, userId: string) => Promise<boolean>
>();
const approveItemMock = vi.fn<(eventId: string, mediaItemId: string) => Promise<void>>();
const discardItemMock = vi.fn<
  (eventId: string, mediaItemId: string) => Promise<{ storagePaths: string[] }>
>();
const deleteStorageMock = vi.fn<(paths: string[]) => Promise<void>>();
const approveAllMock = vi.fn<(eventId: string) => Promise<void>>();
const toggleModeMock = vi.fn<(eventId: string, enabled: boolean) => Promise<void>>();
const markReviewedMock = vi.fn<(eventId: string) => Promise<void>>();

beforeEach(() => {
  checkOrganizerMock.mockReset();
  approveItemMock.mockReset();
  discardItemMock.mockReset();
  deleteStorageMock.mockReset();
  approveAllMock.mockReset();
  toggleModeMock.mockReset();
  markReviewedMock.mockReset();

  checkOrganizerMock.mockResolvedValue(true);

  __test.checkOrganizer = checkOrganizerMock;
  __test.approveItem = approveItemMock;
  __test.discardItem = discardItemMock;
  __test.deleteStorage = deleteStorageMock;
  __test.approveAll = approveAllMock;
  __test.toggleMode = toggleModeMock;
  __test.markReviewed = markReviewedMock;
});

function makeRequest(body: unknown, eventId = "e1") {
  return new Request(`http://localhost/api/events/${eventId}/moderation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("moderation route", () => {
  it("returns 403 when caller is not the organizer", async () => {
    checkOrganizerMock.mockResolvedValue(false);
    const res = await POST(makeRequest({ action: "mark_reviewed" }), {
      params: Promise.resolve({ id: "e1" }),
    });
    expect(res.status).toBe(403);
  });

  it("approves a single item", async () => {
    approveItemMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "approve", mediaItemId: "m1" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(approveItemMock).toHaveBeenCalledWith("e1", "m1");
  });

  it("discards a single item and deletes storage", async () => {
    discardItemMock.mockResolvedValue({ storagePaths: ["events/e1/f.jpg"] });
    deleteStorageMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "discard", mediaItemId: "m2" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(discardItemMock).toHaveBeenCalledWith("e1", "m2");
    expect(deleteStorageMock).toHaveBeenCalledWith(["events/e1/f.jpg"]);
  });

  it("approves all pending items", async () => {
    approveAllMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "approve_all" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(approveAllMock).toHaveBeenCalledWith("e1");
  });

  it("toggles moderation mode", async () => {
    toggleModeMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "toggle_mode", enabled: true }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(toggleModeMock).toHaveBeenCalledWith("e1", true);
  });

  it("marks gallery as reviewed", async () => {
    markReviewedMock.mockResolvedValue(undefined);
    const res = await POST(
      makeRequest({ action: "mark_reviewed" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(200);
    expect(markReviewedMock).toHaveBeenCalledWith("e1");
  });

  it("returns 400 for unknown action", async () => {
    const res = await POST(
      makeRequest({ action: "unknown" }),
      { params: Promise.resolve({ id: "e1" }) },
    );
    expect(res.status).toBe(400);
  });
});
