import { afterEach, describe, expect, it, vi } from "vitest";

describe("GET /api/cron/purge-expired-events", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns 401 without Authorization", async () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    const { GET } = await import("./route");
    const res = await GET(new Request("http://localhost/api/cron/purge-expired-events"));
    expect(res.status).toBe(401);
  });

  it("returns 401 with wrong bearer token", async () => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost/api/cron/purge-expired-events", {
        headers: { Authorization: "Bearer wrong" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 503 when CRON_SECRET is unset", async () => {
    vi.unstubAllEnvs();
    const { GET } = await import("./route");
    const res = await GET(
      new Request("http://localhost/api/cron/purge-expired-events", {
        headers: { Authorization: "Bearer x" },
      }),
    );
    expect(res.status).toBe(503);
  });
});
