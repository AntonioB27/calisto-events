import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

const PROFILE = "https://www.rfc-editor.org/info/rfc9727";

export const dynamic = "force-dynamic";

async function linksetJson(origin: string) {
  const openapiHref = `${origin}/openapi.json`;
  const docsHref = `${origin}/docs/api`;
  const anchor = `${origin}/api/`;
  return {
    linkset: [
      {
        anchor,
        "service-desc": [{ href: openapiHref, type: "application/openapi+json" }],
        "service-doc": [{ href: docsHref, type: "text/html" }],
        status: [{ href: `${origin}/`, type: "text/html" }],
      },
    ],
  };
}

function catalogHeaders(origin: string, withBody: boolean): Headers {
  const h = new Headers();
  h.set("Content-Type", `application/linkset+json; profile="${PROFILE}"`);
  h.set(
    "Link",
    `<${origin}/.well-known/api-catalog>; rel="api-catalog", <${origin}/openapi.json>; rel="service-desc", <${origin}/docs/api>; rel="service-doc"`,
  );
  if (withBody) {
    h.set("Cache-Control", "public, max-age=300, s-maxage=300");
  }
  return h;
}

export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const body = JSON.stringify(await linksetJson(origin));
  const headers = catalogHeaders(origin, true);
  headers.set("Content-Length", String(Buffer.byteLength(body)));
  return new NextResponse(body, { status: 200, headers });
}

export async function HEAD(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  return new NextResponse(null, { status: 200, headers: catalogHeaders(origin, false) });
}
