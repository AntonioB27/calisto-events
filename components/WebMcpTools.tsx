"use client";

import { useEffect } from "react";

type JsonSchema = Record<string, unknown>;

type ModelContextTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  execute: (args: Record<string, unknown>, options: { signal: AbortSignal }) => Promise<unknown>;
};

type ModelContext = {
  registerTool?: (tool: ModelContextTool) => () => void;
};

function getModelContext(): ModelContext | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
}

/** Exposes a small set of navigation helpers for WebMCP-capable browsers. */
export function WebMcpTools() {
  useEffect(() => {
    const mc = getModelContext();
    if (!mc?.registerTool) return;

    const unregister: (() => void)[] = [];
    const ac = new AbortController();

    const reg = (tool: ModelContextTool) => {
      const dispose = mc.registerTool?.(tool);
      if (typeof dispose === "function") unregister.push(dispose);
    };

    const scrollToId = (id: string) => {
      const el = document.getElementById(id.replace(/^#/, ""));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
      return { ok: true as const, id };
    };

    reg({
        name: "calisto_scroll_to_section",
        description: "Scroll the landing page to a major section by hash id (preview, features, how, plans, faq).",
        inputSchema: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: ["preview", "features", "how", "plans", "faq"],
              description: "Section anchor without #",
            },
          },
          required: ["section"],
        },
        execute: async (args) => {
          const section = typeof args.section === "string" ? args.section : "features";
          return scrollToId(section);
        },
      });

    reg({
        name: "calisto_open_waitlist",
        description: "Scroll to the waitlist form at the bottom of the landing page.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        execute: async (_args, { signal }) => {
          if (signal.aborted) throw new DOMException("Aborted", "AbortError");
          return scrollToId("waitlist");
        },
      });

    reg({
        name: "calisto_get_public_api_links",
        description: "Return URLs for OpenAPI, API catalog, and human-readable API docs on this origin.",
        inputSchema: { type: "object", properties: {}, additionalProperties: false },
        execute: async (_args, { signal }) => {
          if (signal.aborted) throw new DOMException("Aborted", "AbortError");
          const origin = window.location.origin;
          return {
            openapi: `${origin}/openapi.json`,
            apiCatalog: `${origin}/.well-known/api-catalog`,
            docs: `${origin}/docs/api`,
            agentSkills: `${origin}/.well-known/agent-skills/index.json`,
          };
        },
      });

    return () => {
      ac.abort();
      unregister.forEach((u) => u());
    };
  }, []);

  return null;
}
