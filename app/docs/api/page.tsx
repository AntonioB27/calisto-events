import Link from "next/link";

export const metadata = {
  title: "Calisto public API",
  description: "Human-readable overview of public HTTP endpoints and discovery documents.",
};

export default function ApiDocsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-neutral-900 dark:text-neutral-100">
      <h1 className="text-2xl font-semibold tracking-tight">Calisto public API</h1>
      <p className="mt-4 leading-relaxed">
        Machine-readable service description:{" "}
        <Link className="text-blue-600 underline dark:text-blue-400" href="/openapi.json">
          OpenAPI document
        </Link>{" "}
        (<code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">GET /openapi.json</code>).
      </p>
      <p className="mt-3 leading-relaxed">
        Discovery:{" "}
        <Link className="text-blue-600 underline dark:text-blue-400" href="/.well-known/api-catalog">
          API catalog
        </Link>{" "}
        (
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">
          GET /.well-known/api-catalog
        </code>
        , <code className="text-sm">application/linkset+json</code>).
      </p>
      <h2 className="mt-10 text-lg font-medium">Public JSON endpoints</h2>
      <ul className="mt-3 list-inside list-disc space-y-2 leading-relaxed">
        <li>
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">POST /api/waitlist</code> —
          join the product waitlist (JSON body with <code>email</code>).
        </li>
        <li>
          <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">
            GET /api/join/preview?code=…
          </code>{" "}
          — resolve event title and plan for a guest access code.
        </li>
      </ul>
      <p className="mt-6 leading-relaxed">
        Authenticated organizer routes under{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">/api/events/…</code> require a
        Supabase session; use OAuth/OIDC metadata linked from{" "}
        <code className="rounded bg-neutral-100 px-1 py-0.5 text-sm dark:bg-neutral-800">
          /.well-known/openid-configuration
        </code>
        .
      </p>
    </main>
  );
}
