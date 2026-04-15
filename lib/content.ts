export const FEATURES = [
  {
    title: "Unique access code",
    description:
      "Each event has its own code (for example WEDDING2026). Guests use it to join—no complicated setup.",
  },
  {
    title: "Invite links & QR",
    description:
      "Share a link or show a QR code so guests can join the album quickly from their phones.",
  },
  {
    title: "Shared gallery",
    description:
      "Everyone sees the same collection in real time as photos and videos arrive—built for weddings and celebrations.",
  },
  {
    title: "Roles that make sense",
    description:
      "Guests upload and browse; organizers create events, manage access, and (on paid plans) export the archive.",
  },
  {
    title: "Photos & videos by plan",
    description:
      "Start with photos on Free; paid plans unlock video uploads with generous limits and longer retention.",
  },
  {
    title: "ZIP export (paid plans)",
    description:
      "Organizers can download the full album as a ZIP after the event—timing depends on your plan.",
  },
] as const;

export const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Create your event",
    description: "Pick a title, date, and storage plan. You become the organizer automatically.",
  },
  {
    step: "2",
    title: "Share code or QR",
    description: "Send guests the access code, invite link, or let them scan your QR—matching is case-insensitive.",
  },
  {
    step: "3",
    title: "Collect & enjoy",
    description:
      "Guests upload and browse together. After the event, retention and export follow the rules of your plan.",
  },
] as const;

export const LIFECYCLE_RULES = [
  "Guests may upload photos and videos until 14 days after the event date.",
  "ZIP export is available to organizers only, starting 24 hours after the event date (paid plans).",
  "All media is automatically deleted after the retention period defined by the chosen plan.",
] as const;

export const FUTURE_FEATURES = [
  {
    title: "Broader event types",
    description:
      "Roadmap: admin and organizer flows for conferences, tournaments, festivals—not only weddings.",
  },
  {
    title: "Payments in the app",
    description:
      "Planned: integrated checkout (for example Stripe) when you upgrade or create paid-tier events.",
  },
  {
    title: "Store presence",
    description:
      "Planned: releases on the App Store and Google Play with ongoing improvements from beta feedback.",
  },
  {
    title: "Comments & richer gallery",
    description:
      "Planned: comments and tagging on photos so guests can engage beyond uploads.",
  },
  {
    title: "Add-on services",
    description:
      "Ideas on the roadmap: professional photo editing, filter packs, print-on-demand.",
  },
] as const;
