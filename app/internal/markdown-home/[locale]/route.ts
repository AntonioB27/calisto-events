import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, getLandingCopy, isLocale, type Locale } from "@/lib/i18n";
import { estimateMarkdownTokens, landingPageMarkdown } from "@/lib/markdown-landing";
import { getPublicOrigin } from "@/lib/public-origin";

type RouteParams = { params: Promise<{ locale: string }> };

async function markdownResponse(locale: Locale): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const copy = getLandingCopy(locale);
  const body = landingPageMarkdown(origin, locale, copy);
  const tokens = estimateMarkdownTokens(body);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokens),
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

export async function GET(_request: Request, ctx: RouteParams): Promise<NextResponse> {
  const { locale: raw } = await ctx.params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return markdownResponse(locale);
}

export async function HEAD(_request: Request, ctx: RouteParams): Promise<NextResponse> {
  const { locale: raw } = await ctx.params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const res = await markdownResponse(locale);
  return new NextResponse(null, {
    status: 200,
    headers: res.headers,
  });
}
