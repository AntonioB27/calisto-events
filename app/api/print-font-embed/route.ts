import { NextResponse } from "next/server";

// Exact URL from app/(app)/events/[id]/print/layout.tsx
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Dancing+Script:wght@500;600;700&family=Montserrat:wght@200;300;400;500&family=Space+Grotesk:wght@300;400;500;600;700&family=Pinyon+Script&family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&family=Jost:wght@300;400;500;600&family=Cinzel:wght@400;500;600&family=Marcellus&family=Fredoka:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap";

// Module-level cache — survives across requests in the same server process
let cachedCss: string | null = null;

export async function GET() {
  if (cachedCss) {
    return new NextResponse(cachedCss, {
      headers: { "Content-Type": "text/css", "Cache-Control": "public, max-age=86400" },
    });
  }

  // Use a Chrome UA so Google Fonts returns compact woff2 files
  const cssText = await fetch(FONT_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  }).then((r) => r.text());

  // Extract every font file URL from the CSS response
  const fontUrls = [...cssText.matchAll(/url\((https:\/\/[^)]+)\)/g)].map((m) => m[1]);

  // Fetch all font files in parallel and encode as base64
  const entries = await Promise.all(
    fontUrls.map(async (url) => {
      const buf = await fetch(url, { next: { revalidate: 86400 } }).then((r) =>
        r.arrayBuffer()
      );
      const base64 = Buffer.from(buf).toString("base64");
      return [url, `data:font/woff2;base64,${base64}`] as const;
    })
  );

  // Replace every URL in the CSS with its base64 data URI
  cachedCss = entries.reduce(
    (css, [url, dataUri]) => css.replaceAll(url, dataUri),
    cssText
  );

  return new NextResponse(cachedCss, {
    headers: { "Content-Type": "text/css", "Cache-Control": "public, max-age=86400" },
  });
}
