/** English legal placeholders — replace with counsel-reviewed text before relying on them in regulated contexts. */

export type LegalSection = Readonly<{ title: string; paragraphs: readonly string[] }>;

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "Calisto (“we”, “us”) collects and processes personal information to provide our event-media product. This Privacy Policy describes what we collect, why we use it, and your choices. If you do not agree, please do not use the service.",
    ],
  },
  {
    title: "What we collect",
    paragraphs: [
      "Account data you provide (such as name, email, and profile details) when you register or sign in, including OAuth profile information from providers you authorize.",
      "Event and content data that organizers and guests submit (event titles, media uploads, access codes, timestamps, technical metadata tied to uploads, and interactions needed to operate shared albums).",
      "Technical data commonly sent by browsers and devices (IP address, coarse location from IP, cookie or local storage identifiers, device/browser type, and diagnostic logs limited to operating the application).",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use data to run the service: authenticate users, display events, enforce plan limits and access rules, send operational emails you request (e.g. password reset), analyze reliability, detect abuse, and comply with law.",
      "Marketing communications are sent only where you explicitly opt in (for example joining a waitlist) and always with applicable unsubscribe or contact options.",
    ],
  },
  {
    title: "Processors and infrastructure",
    paragraphs: [
      "We rely on trusted infrastructure providers, including Supabase (database, authentication, and object storage for media) and Stripe (payments for paid plans). Their processing is governed by their terms and our configuration of the product.",
      "Media you upload is stored in our Supabase project and is accessible to organizers and guests according to the event’s access code and in-app permissions.",
    ],
  },
  {
    title: "Retention and security",
    paragraphs: [
      "We retain information as long as needed to provide the service and meet legal obligations. When an organizer deletes an event, we remove associated application data as implemented in the product, subject to backup and legal retention windows.",
      "We apply reasonable technical and organizational measures appropriate to the risk. No method of transmission or storage is perfectly secure.",
    ],
  },
  {
    title: "Your rights",
    paragraphs: [
      "Depending on where you live, you may have rights to access, correct, delete, object to, or port certain personal data, and to lodge a complaint with a supervisory authority. Contact us at the address below to exercise these rights; we may need to verify your request.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "The service is not directed at children under the age where parental consent is required in your jurisdiction. If you believe we have collected data from a child inappropriately, contact us.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "We may update this policy periodically. Continuing to use the service after changes become effective constitutes acceptance of the revised policy where permitted by law.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Privacy questions or requests: info@calisto-events.com.",
    ],
  },
];

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    title: "Agreement",
    paragraphs: [
      "These Terms of Use (“Terms”) govern access to websites and applications operated for Calisto. By accessing or using the service, you agree to these Terms. If you disagree, discontinue use.",
    ],
  },
  {
    title: "The service",
    paragraphs: [
      "Calisto provides tools for organizers to create events and invite guests to share photos and videos. Features, limits, and availability may change over time.",
    ],
  },
  {
    title: "Accounts and access",
    paragraphs: [
      "You must provide accurate information and protect your credentials. You are responsible for activity under your account except where we are at fault.",
      "Guest access may use limited or anonymous accounts as implemented in the product. Do not share access codes with people you do not intend to admit to an event.",
    ],
  },
  {
    title: "User content",
    paragraphs: [
      "You retain rights to content you submit. To operate the service, you grant Calisto a non-exclusive licence to host, process, transmit, and display such content strictly as needed for the features you choose (including thumbnails, backups, and security scanning where applicable).",
      "Do not upload unlawful, infringing, or harmful material. Organizers decide who may participate in each event within the mechanics of the product.",
    ],
  },
  {
    title: "Plans and payments",
    paragraphs: [
      "Paid tiers (where available) may be billed through Stripe Checkout. Prices, currencies, taxes, refunds, chargebacks, and invoices follow our checkout presentation and Stripe’s applicable rules.",
      "Stripe processes card data; Calisto does not store full card numbers on its own systems as part of the standard Checkout integration.",
    ],
  },
  {
    title: "Acceptable use",
    paragraphs: [
      "You will not probe, disrupt, overload, or reverse engineer the service except where law forbids such a restriction; misuse event access; or attempt to access data you are not permitted to see.",
    ],
  },
  {
    title: "Disclaimers and liability",
    paragraphs: [
      "The service is provided on an “as is” and “as available” basis. To the maximum extent permitted by law, Calisto disclaims implied warranties. Our aggregate liability for claims arising from the service is limited to amounts you paid us in the twelve months before the claim (or, if none, fifty euros), except where liability cannot be limited by law.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access for breach, risk, or legal reasons. You may stop using the service at any time. Provisions that should survive (e.g. liability limits where valid) will survive termination.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These Terms are governed by the laws applicable to the operating company behind Calisto, without regard to conflict-of-law rules, unless mandatory consumer protections in your country say otherwise.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "Questions about these Terms: info@calisto-events.com.",
    ],
  },
];
