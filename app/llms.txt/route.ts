import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

function llmsBody(origin: string): string {
  return `# Calisto

> Calisto is a shared event photo and video album for weddings, birthdays, and celebrations. Guests upload and browse photos directly from their browser — no app download, no account required. Organizers share a QR code or join link; everyone contributing shares the same gallery.

## Key pages

- [Home (English)](${origin}/en)
- [Home (Croatian)](${origin}/hr)
- [Home (German)](${origin}/de)
- [Pricing](${origin}/en#plans)
- [How it works](${origin}/en#how)
- [FAQ](${origin}/en#faq)
- [Live demo](${origin}/demo)
- [Pricing (machine-readable)](${origin}/pricing.md)

## What Calisto does

- Organizers create an event (name, date, plan) and receive a unique join code and QR code
- Guests scan the QR or open the link and upload photos/videos directly from their phone browser
- All uploads appear live in a shared gallery visible to every guest
- Organizers can enable photo moderation: guest uploads land in a private review queue and only appear in the gallery after the organizer approves them
- Organizers can delete individual uploads and download the full gallery as a ZIP
- No app installation required for guests; no account or email required for guests

## Supported event types

Weddings, birthday parties, family reunions, corporate events, festivals, multi-day gatherings

## Pricing summary

All plans are priced per event (one-time, not subscription).

| Plan     | Price | Photos    | Videos    | Guests    | Upload window | Retention |
|----------|-------|-----------|-----------|-----------|---------------|-----------|
| Free     | 0€    | 20        | 0         | 5         | 3 days        | 7 days    |
| Standard | 15€   | 150       | 10        | 30        | 7 days        | 30 days   |
| Plus     | 35€   | 500       | 50        | 100       | 14 days       | 90 days   |
| Premium  | 65€   | 2 000     | 200       | 250       | 30 days       | 180 days  |
| Max      | 90€   | Unlimited | Unlimited | Unlimited | 60 days       | 365 days  |

Upload window = how long after the event date guests can continue uploading.
Retention = how long the album is stored before automatic deletion.

## Contact

Website: ${origin}
`;
}

export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  return new NextResponse(llmsBody(origin), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
