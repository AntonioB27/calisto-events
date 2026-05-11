import { describe, expect, it } from "vitest";

describe("processNextZipExportJob", () => {
  it("exports the worker entrypoint", async () => {
    const { processNextZipExportJob } = await import("./process-zip-export-job");
    expect(processNextZipExportJob).toBeTypeOf("function");
  });
});
