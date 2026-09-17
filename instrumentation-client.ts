import posthog from "posthog-js";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    // Keep browser requests on our domain. This avoids content blockers rejecting
    // PostHog's recorder and event endpoints before Next.js can proxy them.
    api_host: "/ingest",
    asset_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-05-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
