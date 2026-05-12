import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

/** SEP-1649 style MCP server card — transport endpoint is reserved for future MCP over HTTP. */
export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const body = {
    serverInfo: {
      name: "Calisto",
      version: process.env.npm_package_version ?? "0.1.0",
    },
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
    transport: {
      type: "streamable-http",
      endpoint: `${origin}/api/mcp`,
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
