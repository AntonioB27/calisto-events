import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

function robotsBody(origin: string): string {
  const sitemap = `${origin}/sitemap.xml`;
  const blocks = [
    "# https://www.rfc-editor.org/rfc/rfc9309",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "Disallow: /onboarding/",
    "Disallow: /plan-tiers",
    "Disallow: /internal/",
    "Content-Signal: ai-train=no, search=yes, ai-input=no",
    "",
    "User-agent: GPTBot",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "User-agent: ClaudeBot",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "User-agent: anthropic-ai",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "User-agent: PerplexityBot",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "User-agent: Google-Extended",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /auth/",
    "Disallow: /dashboard",
    "Disallow: /events/",
    "Disallow: /settings",
    "",
    "# Block Common Crawl training dataset crawler",
    "User-agent: CCBot",
    "Disallow: /",
    "",
    `Sitemap: ${sitemap}`,
  ];
  return blocks.join("\n");
}

export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const body = robotsBody(origin);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
