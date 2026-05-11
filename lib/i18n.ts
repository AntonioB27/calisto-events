export type Locale = "en" | "hr" | "de";

type NavItem = {
  href: string;
  label: string;
};

type Feature = {
  title: string;
  description: string;
  /** Short line for the mascot speech bubble on the feature card */
  mascotBubble: string;
};

type HowItWorksItem = {
  step: string;
  title: string;
  description: string;
};

type PlanRow = {
  label: string;
  value: string;
};

type Plan = {
  id: "free" | "standard" | "plus" | "premium" | "max";
  name: string;
  tailoredFor: string;
  rows: PlanRow[];
};

type FutureItem = {
  title: string;
  description: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type WaitlistCopy = {
  title: string;
  description: string;
  discount: string;
  submitted: string;
  submitFailed: string;
  inputLabel: string;
  inputPlaceholder: string;
  invalidEmail: string;
  buttonIdle: string;
  buttonBusy: string;
  note: string;
};

export type LandingCopy = {
  languageLabel: string;
  languagePopupSubtitle: string;
  langContinue: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  navAriaLabel: string;
  nav: NavItem[];
  joinWaitlistShort: string;
  heroBadge: string;
  heroIntro: string;
  heroTitle: string;
  heroDescription: string;
  /** Aurora's voice in the hero mascot card—separate from the factual hero subhead. */
  heroAuroraCardBlurb: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroSignals: readonly [string, string, string];
  heroMockLiveUploading: string;
  heroMockGuestsContributing: string;
  heroMockMediaSummary: string;
  heroMockJoinAlbum: string;
  heroMockScanToUpload: string;
  heroMockNoAppNoAccount: string;
  statBar: { value: string; label: string }[];
  appPreviewEyebrow: string;
  appPreviewTitlePrefix: string;
  appPreviewTitleEmphasis: string;
  appPreviewTitleSuffix: string;
  appPreviewMetaLabel: string;
  appPreviewAriaSection: string;
  appPreviewAriaThumbs: string;
  appPreviewCaptions: readonly string[];
  appPreviewViewAriaTemplate: string;
  appPreviewImageAltTemplate: string;
  featuresTitle: string;
  featuresSectionLabel: string;
  featuresDescription: string;
  featuresAuroraBubble: string;
  features: Feature[];
  howTitle: string;
  howSectionLabel: string;
  howSetupHint: string;
  howStepPrefix: string;
  howVisualLive: string;
  howVisualGuests: string;
  howUploadDone: string;
  howModerationApproved: string;
  howModerationNewTemplate: string;
  howDescription: string;
  howItems: HowItWorksItem[];
  plansTitle: string;
  plansSectionLabel: string;
  plansPerEventSuffix: string;
  plansDescriptionStrong: string;
  plansDescriptionRest: string;
  plansAuroraBubble: string;
  plansMascotAlt: string;
  popularBadge: string;
  plans: Plan[];
  planFootnote: string;
  lifecycleTitle: string;
  lifecycleDescription: string;
  lifecycleRules: string[];
  auroraQuote: string;
  auroraQuoteIntro: string;
  auroraQuoteSectionAria: string;
  auroraLabel: string;
  auroraJobTitle: string;
  auroraMascotAlt: string;
  futureTitle: string;
  futureDescription: string;
  futureItems: FutureItem[];
  futureStatusLabels: { roadmap: string; planned: string; idea: string };
  faqTitle: string;
  faqSectionLabel: string;
  faqContactPrefix: string;
  faqContactSuffix: string;
  faq: FaqItem[];
  waitlist: WaitlistCopy;
  footerText: string;
  footerPrivacy: string;
  footerTerms: string;
  footerRightsLine: string;
  brandIconAlt: string;
  pageTitle: string;
  pageDescription: string;
};

export const LOCALES: Locale[] = ["en", "hr", "de"];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

const copy: Record<Locale, LandingCopy> = {
  en: {
    languageLabel: "Language",
    languagePopupSubtitle: "Choose your language and appearance to continue.",
    langContinue: "Continue",
    themeLabel: "Appearance",
    themeLight: "Light",
    themeDark: "Dark",
    navAriaLabel: "Page sections",
    nav: [
      { href: "#preview", label: "Preview" },
      { href: "#features", label: "Features" },
      { href: "#how", label: "How it works" },
      { href: "#plans", label: "Plans" },
      { href: "#faq", label: "FAQ" },
    ],
    joinWaitlistShort: "Join waitlist",
    heroBadge: "Meet Aurora",
    heroIntro: "Hi, I'm Aurora, I'll guide you through Calisto.",
    heroTitle: "One shared album for your wedding or event!",
    heroDescription:
      "Calisto helps guests upload and browse photos and videos in one place. No app download is required; guests can upload with a simple code or QR invite. You pick a plan tier for limits and upload windows — in-app paid checkout is planned, not live yet.",
    heroAuroraCardBlurb:
      "I'd rather you be in the moment than digging through camera rolls on Monday. I'm here so the messy, wonderful parts of your day—the toasts, the candid grins, the kid with cake on his face—stay in one story you can reopen without a scavenger hunt.",
    heroPrimaryCta: "Join the waitlist",
    heroSecondaryCta: "Compare plans",
    heroSignals: [
      "No app to download — guests scan and upload from the browser.",
      "No account required for guests to contribute.",
      "Organizers control the invite code; everyone you invite shares the same gallery.",
    ],
    heroMockLiveUploading: "Live · 3 uploading",
    heroMockGuestsContributing: "84 guests contributing",
    heroMockMediaSummary: "247 photos · 16 videos",
    heroMockJoinAlbum: "Join this album",
    heroMockScanToUpload: "Scan to upload —",
    heroMockNoAppNoAccount: "no app, no account.",
    statBar: [
      { value: "1 code", label: "to join the album" },
      { value: "0 app installs", label: "required for guests" },
      { value: "All tiers", label: "from guest limits to Max" },
    ],
    appPreviewEyebrow: "See it in action",
    appPreviewTitlePrefix: "One album.",
    appPreviewTitleEmphasis: "Every",
    appPreviewTitleSuffix: "angle of the day.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App preview",
    appPreviewAriaThumbs: "Screenshot thumbnails",
    appPreviewCaptions: ["Dobrodošlica", "Početna", "Galerija", "Početna događaja"],
    appPreviewViewAriaTemplate: "View {name}",
    appPreviewImageAltTemplate: "Calisto app — {name}",
    featuresTitle: "What's included",
    featuresSectionLabel: "2 · Features",
    featuresDescription:
      "For days when everyone is taking photos—uploads stay organized and easy to share.",
    featuresAuroraBubble:
      "Every guest upload lands in one gallery—I'll help you keep it tidy.",
    features: [
      {
        title: "Unique access code",
        description: "Each event has its own code (for example WEDDING2026).",
        mascotBubble: "Your event, your code—simple.",
      },
      {
        title: "Invite links & QR",
        description: "Share a link or show a QR code so guests can join the album quickly from their phones.",
        mascotBubble: "Scan or tap—they're in!",
      },
      {
        title: "Shared gallery",
        description:
          "Everyone sees the same collection in real time as photos and videos arrive—built for weddings and celebrations.",
        mascotBubble: "One gallery, all the magic.",
      },
      {
        title: "Roles",
        description: "Guests upload and browse, and organizers manage access.",
        mascotBubble: "Right people, right permissions.",
      },
      {
        title: "Photos & videos by plan",
        description:
          "Photos are included in every plan, and paid plans unlock videos, higher limits, and longer retention.",
        mascotBubble: "I'll match the plan to your story.",
      },
      {
        title: "ZIP export (roadmap)",
        description: "Bulk ZIP download for organizers is planned; it’s not available in the web app today — use per-photo download in the gallery for now.",
        mascotBubble: "We’re building a one-tap export next.",
      },
    ],
    howTitle: "How it works?",
    howSectionLabel: "3 · Three simple steps",
    howSetupHint: "< 90 seconds to set up",
    howStepPrefix: "STEP",
    howVisualLive: "LIVE",
    howVisualGuests: "84 guests",
    howUploadDone: "done",
    howModerationApproved: "approved",
    howModerationNewTemplate: "+{count} new",
    howDescription: "Three steps from empty album to shared memories.",
    howItems: [
      {
        step: "1",
        title: "Create your event",
        description: "Choose a name, date, and plan. You become the organizer automatically.",
      },
      {
        step: "2",
        title: "Share code or QR",
        description: "Send the code or link, or show them the QR.",
      },
      {
        step: "3",
        title: "Browse photos and enjoy",
        description: "Guests upload and browse photos and videos together.",
      },
    ],
    plansTitle: "Plans",
    plansSectionLabel: "4 · Pricing",
    plansPerEventSuffix: "/ event",
    plansDescriptionStrong: "Plan tiers set limits today",
    plansDescriptionRest:
      "guest caps, media quotas, and upload windows follow the tier you pick. List prices show where paid checkout will land — integrated billing (e.g. Stripe) is roadmap. Raising or lowering a tier in Settings updates limits in the app.",
    plansAuroraBubble: "Choose what fits your event now — upgrading is always an option.",
    plansMascotAlt: "Aurora choosing a storage plan",
    popularBadge: "Most popular",
    plans: [
      {
        id: "free",
        name: "Free",
        tailoredFor: "For small birthdays and family gatherings",
        rows: [
          { label: "Price", value: "0€" },
          { label: "Photos", value: "20" },
          { label: "Videos", value: "0" },
          { label: "Guest limit", value: "5" },
          { label: "ZIP export", value: "Not in web app yet (planned)" },
          { label: "Upload window", value: "Guests can upload for 3 days after the event date (see plan logic in app)" },
          { label: "Event deletion", value: "You delete the event in Settings — no automatic purge in the web app today" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "For birthdays and smaller weddings",
        rows: [
          { label: "Price", value: "15€" },
          { label: "Photos", value: "150" },
          { label: "Videos", value: "10" },
          { label: "Guest limit", value: "30" },
          { label: "ZIP export", value: "Not in web app yet (planned)" },
          { label: "Upload window", value: "Upload window: 7 days after the event date (in-app limits)" },
          { label: "Event deletion", value: "Manual delete only — organizer-controlled in Settings" },
        ],
      },
      {
        id: "plus",
        name: "Plus",
        tailoredFor: "For medium celebrations and bigger guest lists",
        rows: [
          { label: "Price", value: "35€" },
          { label: "Photos", value: "500" },
          { label: "Videos", value: "50" },
          { label: "Guest limit", value: "100" },
          { label: "ZIP export", value: "Not in web app yet (planned)" },
          { label: "Upload window", value: "Upload window: 14 days after the event date (in-app limits)" },
          { label: "Event deletion", value: "Manual delete only — organizer-controlled in Settings" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "For large weddings and major celebrations",
        rows: [
          { label: "Price", value: "65€" },
          { label: "Photos", value: "2000" },
          { label: "Videos", value: "200" },
          { label: "Guest limit", value: "250" },
          { label: "ZIP export", value: "Not in web app yet (planned)" },
          { label: "Upload window", value: "Upload window: 30 days after the event date (in-app limits)" },
          { label: "Event deletion", value: "Manual delete only — organizer-controlled in Settings" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Festivals, multi-day events, and unlimited-scale gatherings",
        rows: [
          { label: "Price", value: "90€" },
          { label: "Photos", value: "Unlimited" },
          { label: "Videos", value: "Unlimited" },
          { label: "Guest limit", value: "Unlimited" },
          { label: "ZIP export", value: "Not in web app yet (planned)" },
          { label: "Upload window", value: "Upload window: 60 days after the event date (in-app limits)" },
          { label: "Event deletion", value: "Manual delete only — organizer-controlled in Settings" },
        ],
      },
    ],
    planFootnote:
      "Fair-use policy applies: a reasonable maximum file size per video is enforced to prevent abuse. Uploads that exceed the per-file size limit will be rejected with a clear error message.",
    lifecycleTitle: "Event lifecycle",
    lifecycleDescription: "What the Calisto web app does today vs what ships next — no hidden automatic purge.",
    lifecycleRules: [
      "Guest upload windows are enforced in-app based on plan tier (`uploadDaysAfterEvent`, from 3 days on Free through 60 days on Max).",
      "Organizers manage media in their gallery — remove individual items or delete the entire event from Settings.",
      "Bulk ZIP downloads and integrated checkout are roadmap; retention is not silently timer-deleted inside the web app today.",
    ],
    futureTitle: "On the roadmap",
    futureDescription:
      "We ship the core experience first. These are the features we plan next, and timelines can change.",
    futureItems: [
      {
        title: "Broader event types",
        description: "Roadmap: admin and organizer flows for conferences, tournaments, festivals—not only weddings.",
      },
      {
        title: "Payments in the app",
        description: "Planned: integrated checkout (for example Stripe) when you upgrade or create paid-tier events.",
      },
      {
        title: "Store presence",
        description: "Planned: releases on the App Store and Google Play with ongoing improvements from beta feedback.",
      },
      {
        title: "Comments & richer gallery",
        description: "Planned: comments and tagging on photos so guests can engage beyond uploads.",
      },
      {
        title: "Add-on services",
        description: "Ideas on the roadmap: professional photo editing, filter packs, print-on-demand.",
      },
    ],
    futureStatusLabels: { roadmap: "Roadmap", planned: "Planned", idea: "Idea" },
    faqTitle: "Questions",
    faqSectionLabel: "5 · Questions",
    faqContactPrefix: "If something isn't here, write to",
    faqContactSuffix: "We answer within a day, usually faster.",
    faq: [
      {
        q: "Do guests need to download an app?",
        a: "No. Guests scan the QR code or open the link and upload directly from their browser.",
      },
      {
        q: "Do guests need to create an account?",
        a: "No account or email required. Guests can optionally add their name so you know who uploaded what.",
      },
      {
        q: "Are photos uploaded at full quality?",
        a: "We use smart compression so uploads stay fast and reliable. Your photos still look beautiful on phones and the web, while the app keeps everything smooth and snappy.",
      },
      {
        q: "What if a guest uploads something I don't want?",
        a: "Organizers delete individual photos or videos from the gallery anytime. Dedicated moderation queues are on the roadmap alongside ZIP export.",
      },
      {
        q: "How long are photos and videos stored?",
        a: "The web app keeps everything until someone with access deletes uploads or deletes the entire event — there’s no undocumented auto-purge countdown today. Planned billing and archival policies will be spelled out clearly when checkout launches.",
      },
    ],
    waitlist: {
      title: "Join the waitlist",
      description:
        "Be first to know when Calisto opens up more broadly. Leave your email—we'll only use it for launch updates.",
      discount: "The first 10 people on the waiting list get 20% off any paid plan (Standard, Plus, Premium, or Max).",
      submitted: "You're on the list—we'll be in touch.",
      submitFailed: "Could not join the waitlist right now. Please try again in a moment.",
      inputLabel: "Email",
      inputPlaceholder: "you@example.com",
      invalidEmail: "Enter a valid email address.",
      buttonIdle: "Join the waitlist",
      buttonBusy: "Joining...",
      note: "Discount details and eligibility may be updated before launch. No spam—unsubscribe anytime once we send real emails.",
    },
    footerText: "Event media for weddings and celebrations. Questions? Join the waitlist—we'll reach out.",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    pageTitle: "Calisto — shared event photos & videos",
    pageDescription:
      "Calisto lets wedding and event guests upload and browse photos and videos together. Share a join code or QR; plan tiers set limits inside the web app — integrated payments are roadmap.",
    auroraQuote: "Every memory deserves a home. I'll make sure yours is beautiful, organized, and yours forever.",
    auroraQuoteIntro: "From Aurora · Your Calisto guide",
    auroraQuoteSectionAria: "A message from Aurora",
    auroraLabel: "Aurora",
    auroraJobTitle: "Calisto guide",
    auroraMascotAlt: "Aurora, your Calisto guide",
    footerRightsLine: "All rights reserved.",
    brandIconAlt: "Calisto logo",
  },
  hr: {
    languageLabel: "Jezik",
    languagePopupSubtitle: "Odaberi jezik i izgled da nastaviš.",
    langContinue: "Nastavi",
    themeLabel: "Izgled",
    themeLight: "Svijetla",
    themeDark: "Tamna",
    navAriaLabel: "Sekcije stranice",
    nav: [
      { href: "#preview", label: "Pregled" },
      { href: "#features", label: "Mogućnosti" },
      { href: "#how", label: "Kako radi" },
      { href: "#plans", label: "Paketi" },
      { href: "#faq", label: "Pitanja" },
    ],
    joinWaitlistShort: "Pridruži se listi",
    heroBadge: "Upoznaj Auroru",
    heroIntro: "Bok, ja sam Aurora, predstavljam ti Calisto.",
    heroTitle: "Jedan zajednički album za tvoje vjenčanje ili događaj!",
    heroDescription:
      "Gosti na jednom mjestu dijele fotografije i videa. Bez preuzimanja aplikacije — pristup je kodom ili QR-om. Odabireš paket radi limita i upload prozora; integrirani checkout je u planu, još nije aktivan u web aplikaciji.",
    heroAuroraCardBlurb:
      "Želim da budeš na plesu, a ne da u ponedjeljak pretražuješ deset mapi s fotkama. Tu sam da taj neuredno lijepi dan — toaste, prvi ples, taj tren s kolačem — ostane jedna priča koju možeš otvoriti bez detektivskog posla.",
    heroPrimaryCta: "Pridruži se listi čekanja",
    heroSecondaryCta: "Usporedi pakete",
    heroSignals: [
      "Nema preuzimanja aplikacije — gosti skeniraju i učitavaju u pregledniku.",
      "Gostima nije obavezan račun.",
      "Organizator upravlja pozivnim kodom — svi s pristupom dijele istu galeriju.",
    ],
    heroMockLiveUploading: "Uživo · 3 u prijenosu",
    heroMockGuestsContributing: "84 gosta sudjeluju",
    heroMockMediaSummary: "247 fotografija · 16 videa",
    heroMockJoinAlbum: "Pridruži se albumu",
    heroMockScanToUpload: "Skeniraj za upload —",
    heroMockNoAppNoAccount: "bez aplikacije, bez računa.",
    statBar: [
      { value: "1 kod", label: "za ulazak u album" },
      { value: "0 instalacija", label: "potrebno gostima" },
      { value: "Paketi", label: "Free do Max" },
    ],
    appPreviewEyebrow: "Izgled aplikacije",
    appPreviewTitlePrefix: "Jedan album.",
    appPreviewTitleEmphasis: "Svaki",
    appPreviewTitleSuffix: "kutak dana.",
    appPreviewMetaLabel: "calisto · organizator",
    appPreviewAriaSection: "Pregled aplikacije",
    appPreviewAriaThumbs: "Minijature snimki zaslona",
    appPreviewCaptions: ["Willkommen", "Startseite", "Galerie", "Event-Startseite"],
    appPreviewViewAriaTemplate: "Pogledaj: {name}",
    appPreviewImageAltTemplate: "Calisto aplikacija — {name}",
    featuresTitle: "Što sve uključuje",
    featuresSectionLabel: "2 · Mogućnosti",
    featuresDescription: "Za dane kad svi fotografiraju — uploadovi ostaju uredni i lako dijeljivi.",
    featuresAuroraBubble:
      "Svaki gost učitava u jednu galeriju — pomažem da sve ostane uredno.",
    features: [
      {
        title: "Jedinstveni pristupni kod",
        description: "Svaki događaj ima svoj kod (npr. WEDDING2026).",
        mascotBubble: "Tvoj događaj, tvoj kod—lako.",
      },
      {
        title: "Pozivni linkovi i QR",
        description: "Podijeli link ili QR i gosti se brzo pridružuju s mobitela.",
        mascotBubble: "Skeniraj ili dodirni—ulaze odmah!",
      },
      {
        title: "Zajednička galerija",
        description: "Svi vide istu galeriju u stvarnom vremenu dok stižu fotografije i videa.",
        mascotBubble: "Jedna galerija, svi u istom trenu.",
      },
      {
        title: "Uloge",
        description: "Gosti učitavaju i gledaju, a organizatori vode pristup.",
        mascotBubble: "Uloge koje drže red.",
      },
      {
        title: "Fotografije i videa po paketu",
        description: "Fotografije su uključene u svaki paket, a plaćeni otključavaju videa, veće limite i duže čuvanje.",
        mascotBubble: "Paket uskladim s pričom.",
      },
      {
        title: "ZIP izvoz (roadmap)",
        description: "Skupni ZIP za organizatore planiramo; u web aplikaciji za sada ne postoji — pojedinačne datoteke iz galerije.",
        mascotBubble: "Radimo na jednom kliku za preuzimanje.",
      },
    ],
    howTitle: "Kako funkcionira?",
    howSectionLabel: "3 · Tri jednostavna koraka",
    howSetupHint: "< 90 sekundi za postavljanje",
    howStepPrefix: "KORAK",
    howVisualLive: "UŽIVO",
    howVisualGuests: "84 gosta",
    howUploadDone: "gotovo",
    howModerationApproved: "odobreno",
    howModerationNewTemplate: "+{count} novo",
    howDescription: "Tri koraka do zajedničkog albuma.",
    howItems: [
      {
        step: "1",
        title: "Kreiraj događaj",
        description: "Odaberi naziv, datum i paket. Automatski postaješ organizator.",
      },
      {
        step: "2",
        title: "Podijeli kod ili QR",
        description: "Pošalji kod ili link, ili im pokaži QR.",
      },
      {
        step: "3",
        title: "Pregledavaj slike i uživaj",
        description: "Gosti zajedno učitavaju i pregledavaju slike i videozapise.",
      },
    ],
    plansTitle: "Paketi",
    plansSectionLabel: "4 · Cijene",
    plansPerEventSuffix: "/ događaj",
    plansDescriptionStrong: "Paketi određuju limite danas",
    plansDescriptionRest:
      "kapaciteti, upload prozori i videi definiraju se paketom. Cijene su referenca za budući checkout — integracija plaćanja (npr. Stripe) je na roadmapu. U Postavkama događaja možeš promijeniti paket unutar aplikacije.",
    plansAuroraBubble: "Odaberi što sada odgovara tvom događaju — nadogradnja je uvijek opcija.",
    plansMascotAlt: "Aurora bira paket pohrane",
    popularBadge: "Najpopularniji",
    plans: [
      {
        id: "free",
        name: "Free",
        tailoredFor: "Za male rođendane i obiteljska okupljanja",
        rows: [
          { label: "Cijena", value: "0€" },
          { label: "Fotografije", value: "20" },
          { label: "Videa", value: "0" },
          { label: "Limit gostiju", value: "5" },
          { label: "ZIP izvoz", value: "Još nema u web aplikaciji (planirano)" },
          { label: "Rok uploada", value: "3 dana nakon datuma događaja (logika u aplikaciji)" },
          { label: "Brisanje događaja", value: "Ručno u Postavkama — nema skrivenog automatskog brisanja" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "Za rođendane i manja vjenčanja",
        rows: [
          { label: "Cijena", value: "15€" },
          { label: "Fotografije", value: "150" },
          { label: "Videa", value: "10" },
          { label: "Limit gostiju", value: "30" },
          { label: "ZIP izvoz", value: "Još nema u web aplikaciji (planirano)" },
          { label: "Rok uploada", value: "7 dana nakon datuma događaja (logika u aplikaciji)" },
          { label: "Brisanje događaja", value: "Ručno brisanje — kontrola organizatora" },
        ],
      },
      {
        id: "plus",
        name: "Plus",
        tailoredFor: "Za srednje proslave i duže liste gostiju",
        rows: [
          { label: "Cijena", value: "35€" },
          { label: "Fotografije", value: "500" },
          { label: "Videa", value: "50" },
          { label: "Limit gostiju", value: "100" },
          { label: "ZIP izvoz", value: "Još nema u web aplikaciji (planirano)" },
          { label: "Rok uploada", value: "14 dana nakon datuma događaja (logika u aplikaciji)" },
          { label: "Brisanje događaja", value: "Ručno brisanje — kontrola organizatora" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "Za velika vjenčanja i svečane događaje",
        rows: [
          { label: "Cijena", value: "65€" },
          { label: "Fotografije", value: "2000" },
          { label: "Videa", value: "200" },
          { label: "Limit gostiju", value: "250" },
          { label: "ZIP izvoz", value: "Još nema u web aplikaciji (planirano)" },
          { label: "Rok uploada", value: "30 dana nakon datuma događaja (logika u aplikaciji)" },
          { label: "Brisanje događaja", value: "Ručno brisanje — kontrola organizatora" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Za festivale, višednevne evente i neograničeni obuhvat",
        rows: [
          { label: "Cijena", value: "90€" },
          { label: "Fotografije", value: "Neograničeno" },
          { label: "Videa", value: "Neograničeno" },
          { label: "Limit gostiju", value: "Neograničeno" },
          { label: "ZIP izvoz", value: "Još nema u web aplikaciji (planirano)" },
          { label: "Rok uploada", value: "60 dana nakon datuma događaja (logika u aplikaciji)" },
          { label: "Brisanje događaja", value: "Ručno brisanje — kontrola organizatora" },
        ],
      },
    ],
    planFootnote:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe. Datoteke koje prelaze limit bit će odbijene uz jasnu poruku.",
    lifecycleTitle: "Životni ciklus događaja",
    lifecycleDescription: "Što radi web aplikacija danas naspram što slijedi — bez skrivenog automatskog brisanja.",
    lifecycleRules: [
      "Gosti mogu učitavati još neko vrijeme nakon datuma događaja — koliko dugo ovisi o paketu (od 3 dana na Free do 60 dana na Max).",
      "Organizator može ukloniti pojedinačne datoteke u galeriji ili obrisati cijeli događaj u Postavkama.",
      "Skupni ZIP i plaćanje unutar aplikacije su na roadmapu; nema tajnog automatskog brisanja samo zbog vremena.",
    ],
    futureTitle: "Na roadmapu",
    futureDescription:
      "Prvo isporučujemo osnovno iskustvo. Ovo su funkcionalnosti koje planiramo dalje, a vremenski okviri se mogu mijenjati.",
    futureItems: [
      {
        title: "Širenje na druge događaje",
        description: "Roadmap: admin i organizer tokovi za konferencije, turnire i festivale, ne samo vjenčanja.",
      },
      {
        title: "Plaćanja u aplikaciji",
        description: "Planirano: integrirani checkout (npr. Stripe) kod nadogradnje ili kreiranja plaćenih paketa.",
      },
      {
        title: "Objava u trgovinama",
        description: "Planirano: objave na App Store i Google Play uz stalna poboljšanja iz beta povratnih informacija.",
      },
      {
        title: "Komentari i bogatija galerija",
        description: "Planirano: komentari i tagiranje fotografija za bolju interakciju gostiju.",
      },
      {
        title: "Dodatne usluge",
        description: "Ideje na roadmapu: profesionalno uređivanje fotografija, filter paketi i print-on-demand.",
      },
    ],
    futureStatusLabels: { roadmap: "Roadmap", planned: "Planirano", idea: "Ideja" },
    faqTitle: "Česta pitanja",
    faqSectionLabel: "5 · Pitanja",
    faqContactPrefix: "Ako ovdje nema odgovora, piši na",
    faqContactSuffix: "Odgovaramo unutar jednog dana, često i brže.",
    faq: [
      {
        q: "Trebaju li gosti preuzeti aplikaciju?",
        a: "Ne. Gosti skeniraju QR kod ili otvore link i učitavaju izravno iz preglednika.",
      },
      {
        q: "Trebaju li gosti stvoriti račun?",
        a: "Ni račun ni email nije potreban. Gosti mogu po želji dodati ime kako bi znali tko je što učitao.",
      },
      {
        q: "Učitavaju li se fotografije u punoj kvaliteti?",
        a: "Koristimo pametnu kompresiju kako bi upload bio brz i pouzdan. Fotografije i dalje izgledaju odlično na mobitelu i u pregledniku, a aplikacija sve drži glatkim i brzim.",
      },
      {
        q: "Što ako gost učita nešto što ne želim?",
        a: "Organizator u bilo kojem trenutku može obrisati pojedinačne fotografije ili videa iz galerije. Posebni moderacijski redovi i ZIP su na roadmapu.",
      },
      {
        q: "Koliko dugo su fotografije i videa pohranjeni?",
        a: "Web aplikacija drži sve dok netko s pristupom ne obriše učitane datoteke ili cijeli događaj — danas nema skrivenog automatskog čišćenja. Kad checkout bude aktivan, pravila naplate i arhiviranja bit će jasno objavljena.",
      },
    ],
    waitlist: {
      title: "Pridruži se listi čekanja",
      description: "Ostavi email i saznaj među prvima kad Calisto krene šire.",
      discount: "Prvih 10 na listi dobiva 20% popusta na bilo koji plaćeni paket (Standard, Plus, Premium ili Max).",
      submitted: "Na listi si — javimo ti se uskoro.",
      submitFailed: "Trenutno se ne možeš prijaviti na listu čekanja. Pokušaj ponovno za trenutak.",
      inputLabel: "Email",
      inputPlaceholder: "ti@primjer.com",
      invalidEmail: "Unesi valjanu email adresu.",
      buttonIdle: "Pridruži se listi čekanja",
      buttonBusy: "Prijava...",
      note: "Detalji popusta i uvjeti mogu se promijeniti prije lansiranja. Bez spama — odjava je uvijek moguća.",
    },
    footerText: "Calisto za vjenčanja i proslave. Imaš pitanje? Pridruži se listi čekanja.",
    footerPrivacy: "Privatnost",
    footerTerms: "Uvjeti",
    pageTitle: "Calisto — zajedničke fotografije i videa događaja",
    pageDescription:
      "Calisto gostima omogućuje učitavanje i pregled fotografija i videa na jednom mjestu. Podijeli kod ili QR; paketi određuju limite u web aplikaciji — integrirana plaćanja su na roadmapu.",
    auroraQuote: "Svaka uspomena zaslužuje dom. Pobrinut ću se da bude lijepa, organizirana i zauvijek vaša.",
    auroraQuoteIntro: "",
    auroraQuoteSectionAria: "Poruka od Aurore",
    auroraLabel: "Aurora",
    auroraJobTitle: "Calisto vodič",
    auroraMascotAlt: "Aurora, tvoj Calisto vodič",
    footerRightsLine: "Sva prava pridržana.",
    brandIconAlt: "Calisto logotip",
  },
  de: {
    languageLabel: "Sprache",
    languagePopupSubtitle: "Wähle Sprache und Darstellung, um fortzufahren.",
    langContinue: "Weiter",
    themeLabel: "Darstellung",
    themeLight: "Hell",
    themeDark: "Dunkel",
    navAriaLabel: "Seitenabschnitte",
    nav: [
      { href: "#preview", label: "Vorschau" },
      { href: "#features", label: "Funktionen" },
      { href: "#how", label: "So funktioniert es" },
      { href: "#plans", label: "Tarife" },
      { href: "#faq", label: "Fragen" },
    ],
    joinWaitlistShort: "Zur Warteliste",
    heroBadge: "Lerne Aurora kennen",
    heroIntro: "Hi, ich bin Aurora, ich stelle dir Calisto vor.",
    heroTitle: "Ein gemeinsames Album für Hochzeit oder Event!",
    heroDescription:
      "Calisto hilft Gästen, Fotos und Videos an einem Ort hochzuladen und anzusehen. Kein App-Download nötig; Gäste laden mit Code oder QR aus dem Browser ein. Du wählst einen Tarif für Limits und Upload-Fenster — integrierter Checkout in der Web-App ist geplant, aber noch nicht live.",
    heroAuroraCardBlurb:
      "Lieber tanzt du auf der Feier, als dass du am Montag hundert Chatverläufe durchsuchst. Ich will, dass der Tag als eine lebendige Geschichte bleibt — Reden, Umarmungen, das schiefe Gruppenfoto — die man wiederfindet, ohne Schatzsuche.",
    heroPrimaryCta: "Zur Warteliste",
    heroSecondaryCta: "Tarife vergleichen",
    heroSignals: [
      "Keine App zum Herunterladen — Gäste scannen und laden im Browser.",
      "Kein Konto für Gäste erforderlich.",
      "Organisator:innen steuern den Einladungscode; alle Eingeladenen teilen dieselbe Galerie.",
    ],
    heroMockLiveUploading: "Live · 3 Uploads",
    heroMockGuestsContributing: "84 Gäste beteiligen sich",
    heroMockMediaSummary: "247 Fotos · 16 Videos",
    heroMockJoinAlbum: "Diesem Album beitreten",
    heroMockScanToUpload: "Zum Upload scannen —",
    heroMockNoAppNoAccount: "keine App, kein Konto.",
    statBar: [
      { value: "1 Code", label: "für den Albumzugang" },
      { value: "0 App-Installationen", label: "für Gäste nötig" },
      { value: "Alle Tarife", label: "vom Gästelimit bis Max" },
    ],
    appPreviewEyebrow: "Sieh es in Aktion",
    appPreviewTitlePrefix: "Ein Album.",
    appPreviewTitleEmphasis: "Jeder",
    appPreviewTitleSuffix: "Augenblick des Tages.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App-Vorschau",
    appPreviewAriaThumbs: "Screenshot-Vorschau",
    appPreviewCaptions: ["Wellcome", "Home", "Gallery", "Event Home"],
    appPreviewViewAriaTemplate: "{name} ansehen",
    appPreviewImageAltTemplate: "Calisto-App — {name}",
    featuresTitle: "Was du machen kannst",
    featuresSectionLabel: "2 · Funktionen",
    featuresDescription:
      "Für große Tage, an denen alle fotografieren – Calisto hält Uploads organisiert und leicht teilbar.",
    featuresAuroraBubble:
      "Alle Uploads landen in einer Galerie – ich helfe, alles ordentlich zu halten.",
    features: [
      {
        title: "Einzigartiger Zugangscode",
        description: "Jedes Event hat seinen eigenen Code (z. B. WEDDING2026). Gäste treten ohne kompliziertes Setup bei.",
        mascotBubble: "Dein Event, dein Code—so einfach.",
      },
      {
        title: "Einladungslinks & QR",
        description: "Teile einen Link oder zeige einen QR-Code, damit Gäste dem Album schnell vom Handy beitreten.",
        mascotBubble: "Scannen oder tippen—fertig!",
      },
      {
        title: "Gemeinsame Galerie",
        description: "Alle sehen dieselbe Sammlung in Echtzeit, sobald Fotos und Videos eintreffen – ideal für Feiern.",
        mascotBubble: "Eine Galerie, alle im gleichen Takt.",
      },
      {
        title: "Rollen",
        description: "Gäste laden hoch und stöbern, Organisator:innen verwalten den Zugang.",
        mascotBubble: "Die passenden Berechtigungen.",
      },
      {
        title: "Fotos & Videos nach Tarif",
        description:
          "Fotos sind in jedem Tarif enthalten; kostenpflichtige Tarife schalten Videos, höhere Limits und längere Upload-Fenster frei.",
        mascotBubble: "Ich passe den Tarif an eure Geschichte an.",
      },
      {
        title: "ZIP-Export (Roadmap)",
        description:
          "Sammel-Download als ZIP für Organisator:innen ist geplant; in der Web-App gibt es das noch nicht — vorerst einzelne Downloads aus der Galerie.",
        mascotBubble: "Ein-Klick-Export kommt als Nächstes.",
      },
    ],
    howTitle: "So funktioniert es",
    howSectionLabel: "3 · Drei einfache Schritte",
    howSetupHint: "< 90 Sekunden zum Einrichten",
    howStepPrefix: "SCHRITT",
    howVisualLive: "LIVE",
    howVisualGuests: "84 Gäste",
    howUploadDone: "fertig",
    howModerationApproved: "freigegeben",
    howModerationNewTemplate: "+{count} neu",
    howDescription: "Drei Schritte vom leeren Album zu gemeinsamen Erinnerungen.",
    howItems: [
      {
        step: "1",
        title: "Event erstellen",
        description: "Wähle Titel, Datum und Speichertarif. Du wirst automatisch Organisator.",
      },
      {
        step: "2",
        title: "Code oder QR teilen",
        description: "Sende den Zugangscode, einen Einladungslink oder lass Gäste den QR-Code scannen.",
      },
      {
        step: "3",
        title: "Sammeln & genießen",
        description: "Gäste laden gemeinsam hoch und stöbern Fotos und Videos zusammen.",
      },
    ],
    plansTitle: "Tarife",
    plansSectionLabel: "4 · Preise",
    plansPerEventSuffix: "/ Event",
    plansDescriptionStrong: "Tarifstufen setzen heute die Grenzen fest",
    plansDescriptionRest:
      "Gästelimits, Mediakontingente und Upload-Fenster richten sich nach der gewählten Stufe. Die Preise sind eine Referenz für künftigen Checkout — integrierte Abrechnung (z. B. Stripe) steht auf der Roadmap. In den Event-Einstellungen kannst du den Tarif ändern, um die Limits in der App anzupassen.",
    plansAuroraBubble:
      "Such dir den passenden Tarif – upgraden kannst du später, wenn du mehr brauchst.",
    plansMascotAlt: "Aurora wählt einen Speichertarif",
    popularBadge: "Beliebt",
    plans: [
      {
        id: "free",
        name: "Free",
        tailoredFor: "Für kleine Geburtstage und Abendfeiern",
        rows: [
          { label: "Preis", value: "0€" },
          { label: "Fotos", value: "20" },
          { label: "Videos", value: "0" },
          { label: "Gästelimit", value: "5" },
          { label: "ZIP-Export", value: "Noch nicht in der Web-App (geplant)" },
          { label: "Upload-Fenster", value: "Gäste können 3 Tage nach dem Eventdatum hochladen (Limits in der App)" },
          {
            label: "Event-Löschung",
            value: "Manuell in den Einstellungen — heute keine automatische Löschung in der Web-App",
          },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "Für Geburtstage und kleinere Hochzeiten",
        rows: [
          { label: "Preis", value: "15€" },
          { label: "Fotos", value: "150" },
          { label: "Videos", value: "10" },
          { label: "Gästelimit", value: "30" },
          { label: "ZIP-Export", value: "Noch nicht in der Web-App (geplant)" },
          { label: "Upload-Fenster", value: "Upload-Fenster: 7 Tage nach dem Eventdatum (Limits in der App)" },
          { label: "Event-Löschung", value: "Nur manuelle Löschung — Kontrolle durch Organisator:innen in den Einstellungen" },
        ],
      },
      {
        id: "plus",
        name: "Plus",
        tailoredFor: "Für mittlere Feiern und größere Gästelisten",
        rows: [
          { label: "Preis", value: "35€" },
          { label: "Fotos", value: "500" },
          { label: "Videos", value: "50" },
          { label: "Gästelimit", value: "100" },
          { label: "ZIP-Export", value: "Noch nicht in der Web-App (geplant)" },
          { label: "Upload-Fenster", value: "Upload-Fenster: 14 Tage nach dem Eventdatum (Limits in der App)" },
          { label: "Event-Löschung", value: "Nur manuelle Löschung — Kontrolle durch Organisator:innen in den Einstellungen" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "Für große Hochzeiten und besondere Anlässe",
        rows: [
          { label: "Preis", value: "65€" },
          { label: "Fotos", value: "2000" },
          { label: "Videos", value: "200" },
          { label: "Gästelimit", value: "250" },
          { label: "ZIP-Export", value: "Noch nicht in der Web-App (geplant)" },
          { label: "Upload-Fenster", value: "Upload-Fenster: 30 Tage nach dem Eventdatum (Limits in der App)" },
          { label: "Event-Löschung", value: "Nur manuelle Löschung — Kontrolle durch Organisator:innen in den Einstellungen" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Festivals, mehrtägige Events und unbegrenzten Spielraum",
        rows: [
          { label: "Preis", value: "90€" },
          { label: "Fotos", value: "Unbegrenzt" },
          { label: "Videos", value: "Unbegrenzt" },
          { label: "Gästelimit", value: "Unbegrenzt" },
          { label: "ZIP-Export", value: "Noch nicht in der Web-App (geplant)" },
          { label: "Upload-Fenster", value: "Upload-Fenster: 60 Tage nach dem Eventdatum (Limits in der App)" },
          { label: "Event-Löschung", value: "Nur manuelle Löschung — Kontrolle durch Organisator:innen in den Einstellungen" },
        ],
      },
    ],
    planFootnote:
      "Fair-Use gilt: zur Missbrauchsprävention wird eine angemessene maximale Dateigröße pro Video durchgesetzt. Uploads über dem Limit werden mit einer klaren Fehlermeldung abgewiesen.",
    lifecycleTitle: "Event-Lebenszyklus",
    lifecycleDescription: "Was die Calisto-Web-App heute schon tut und was später kommt — ohne versteckte automatische Bereinigung.",
    lifecycleRules: [
      "Nach dem Eventdatum dürfen Gäste noch begrenzt hochladen — wie lange, hängt vom Tarif ab (von 3 Tagen beim Free-Tarif bis 60 Tagen bei Max).",
      "Organisator:innen verwalten Medien in der Galerie — Einzelmedien löschen oder das gesamte Event in den Einstellungen entfernen.",
      "Massen-ZIP-Download und integrierter Checkout sind Roadmap-Themen; in der Web-App läuft heute kein stiller Timer fürs Löschen.",
    ],
    futureTitle: "Auf der Roadmap",
    futureDescription:
      "Wir liefern zuerst das Kernerlebnis. Das planen wir als Nächstes – Zeitpläne können sich durch Nutzerfeedback ändern.",
    futureItems: [
      {
        title: "Weitere Event-Typen",
        description: "Roadmap: Admin- und Organizer-Flows für Konferenzen, Turniere und Festivals, nicht nur Hochzeiten.",
      },
      {
        title: "Zahlungen in der App",
        description: "Geplant: integrierter Checkout (z. B. Stripe) für Upgrades und bezahlte Tarife.",
      },
      {
        title: "Store-Veröffentlichung",
        description: "Geplant: Launch im App Store und bei Google Play mit kontinuierlichen Verbesserungen.",
      },
      {
        title: "Kommentare & bessere Galerie",
        description: "Geplant: Kommentare und Markierungen bei Fotos für mehr Interaktion unter Gästen.",
      },
      {
        title: "Zusatzservices",
        description: "Ideen auf der Roadmap: professionelle Bildbearbeitung, Filterpakete und Print-on-Demand.",
      },
    ],
    futureStatusLabels: { roadmap: "Roadmap", planned: "Geplant", idea: "Idee" },
    faqTitle: "Fragen",
    faqSectionLabel: "5 · Fragen",
    faqContactPrefix: "Wenn etwas fehlt, schreib an",
    faqContactSuffix: "Wir antworten innerhalb eines Tages, oft schneller.",
    faq: [
      {
        q: "Müssen Gäste eine App herunterladen?",
        a: "Nein. Gäste scannen den QR-Code oder öffnen den Link und laden direkt aus dem Browser.",
      },
      {
        q: "Müssen Gäste ein Konto erstellen?",
        a: "Kein Konto und keine E-Mail nötig. Gäste können optional ihren Namen angeben, damit du siehst, wer was hochgeladen hat.",
      },
      {
        q: "Werden Fotos in voller Qualität hochgeladen?",
        a: "Wir nutzen smarte Kompression, damit Uploads schnell und zuverlässig bleiben. Die Fotos sehen auf Phones und im Web weiterhin sehr gut aus, und die App bleibt flüssig.",
      },
      {
        q: "Was, wenn ein Gast etwas hochlädt, das ich nicht möchte?",
        a: "Organisator:innen löschen einzelne Fotos oder Videos jederzeit aus der Galerie. Eigene Moderationswarteschlangen sind auf der Roadmap, ebenso ZIP-Export.",
      },
      {
        q: "Wie lange werden Fotos und Videos gespeichert?",
        a: "Die Web-App behält alles, bis jemand mit Zugriff Uploads löscht oder das ganze Event entfernt — heute gibt es keinen stillen Auto-Purge-Countdown. Abrechnung und Archivierungsregeln werden formuliert, sobald Checkout startet.",
      },
    ],
    waitlist: {
      title: "Zur Warteliste",
      description: "Erfahre als Erste oder Erster alle Neuigkeiten von Calisto. Hinterlasse deine E-Mail für Launch-Updates.",
      discount: "Die ersten 10 Personen auf der Warteliste erhalten 20% Rabatt auf jeden bezahlten Tarif (Standard, Plus, Premium oder Max).",
      submitted: "Du bist auf der Liste – wir melden uns bald.",
      submitFailed: "Ein Eintrag in die Warteliste ist gerade nicht möglich. Bitte versuche es gleich noch einmal.",
      inputLabel: "E-Mail",
      inputPlaceholder: "du@beispiel.de",
      invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
      buttonIdle: "Zur Warteliste",
      buttonBusy: "Wird eingetragen...",
      note: "Rabattdetails und Teilnahmebedingungen können vor dem Launch angepasst werden. Kein Spam.",
    },
    footerText: "Event-Medien für Hochzeiten und Feiern. Fragen? Trag dich in die Warteliste ein.",
    footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
    pageTitle: "Calisto — gemeinsame Event-Fotos & Videos",
    pageDescription:
      "Calisto lässt Hochzeits- und Eventgäste Fotos und Videos gemeinsam hochladen und ansehen. Code oder QR teilen; Tarifgrenzen gelten in der Web-App — integrierte Zahlungen stehen auf der Roadmap.",
    auroraQuote: "Jede Erinnerung verdient ein Zuhause. Ich sorge dafür, dass deines schön, geordnet und für immer deins ist.",
    auroraQuoteIntro: "Von Aurora · Dein Calisto-Guide",
    auroraQuoteSectionAria: "Eine Nachricht von Aurora",
    auroraLabel: "Aurora",
    auroraJobTitle: "Calisto-Guide",
    auroraMascotAlt: "Aurora, dein Calisto-Guide",
    footerRightsLine: "Alle Rechte vorbehalten.",
    brandIconAlt: "Calisto-Logo",
  },
};

export function getLandingCopy(locale: Locale): LandingCopy {
  return copy[locale];
}
