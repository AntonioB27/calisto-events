import { NextResponse } from "next/server";

/**
 * Placeholder MCP streamable-HTTP surface. Returns a JSON-RPC shaped error until a full MCP
 * server is deployed; keeps /.well-known/mcp/server-card.json truthful about the URL.
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32000,
        message: "MCP server is not enabled on this deployment.",
      },
    },
    { status: 501 },
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Method Not Allowed", detail: "Use POST for MCP streamable HTTP." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
