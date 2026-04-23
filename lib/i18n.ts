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
  id: "free" | "standard" | "premium" | "max";
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
export const DEFAULT_LOCALE: Locale = "hr";

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
      "Calisto helps guests upload and browse photos and videos in one place. No app download is required, and guests can upload without creating an account. Access is by code or QR, with one-time event pricing.",
    heroAuroraCardBlurb:
      "I'd rather you be in the moment than digging through camera rolls on Monday. I'm here so the messy, wonderful parts of your day—the toasts, the candid grins, the kid with cake on his face—stay in one story you can reopen without a scavenger hunt.",
    heroPrimaryCta: "Join the waitlist",
    heroSecondaryCta: "Compare plans",
    heroSignals: [
      "No app to download — guests scan and upload from the browser.",
      "No account required, even for full-quality uploads.",
      "Only the organizer sees, approves, and shares.",
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
      { value: "24h", label: "to ZIP export start" },
    ],
    appPreviewEyebrow: "See it in action",
    appPreviewTitlePrefix: "One album.",
    appPreviewTitleEmphasis: "Every",
    appPreviewTitleSuffix: "angle of the day.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App preview",
    appPreviewAriaThumbs: "Screenshot thumbnails",
    appPreviewCaptions: ["Guest welcome", "Gallery view", "Download", "Guest list"],
    appPreviewViewAriaTemplate: "View {name}",
    appPreviewImageAltTemplate: "Calisto app — {name}",
    featuresTitle: "What you can do",
    featuresSectionLabel: "2 · Features",
    featuresDescription:
      "Built for big days when everyone is taking pictures—Calisto keeps uploads organized and easy to share.",
    featuresAuroraBubble:
      "Every guest upload lands in one gallery—I'll help you keep it tidy.",
    features: [
      {
        title: "Unique access code",
        description:
          "Each event has its own code (for example WEDDING2026). Guests use it to join—no complicated setup.",
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
        title: "Roles that make sense",
        description:
          "Guests upload and browse; organizers create events, manage access, and (on paid plans) export the archive.",
        mascotBubble: "Right people, right permissions.",
      },
      {
        title: "Photos & videos by plan",
        description:
          "Start with photos on Free; paid plans unlock video uploads with generous limits and longer retention.",
        mascotBubble: "I'll match the plan to your story.",
      },
      {
        title: "ZIP export (paid plans)",
        description: "Organizers can download the full album as a ZIP after the event, and guests can too on a paid plan.",
        mascotBubble: "Zip the memories when you're ready.",
      },
    ],
    howTitle: "How it works",
    howSectionLabel: "3 · Three quiet steps",
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
        description: "Pick a title, date, and storage plan. You become the organizer automatically.",
      },
      {
        step: "2",
        title: "Share code or QR",
        description:
          "Send guests the access code, invite link, or let them scan your QR—matching is case-insensitive.",
      },
      {
        step: "3",
        title: "Collect & enjoy",
        description:
          "Guests upload and browse together. After the event, retention and export follow the rules of your plan.",
      },
    ],
    plansTitle: "Plans",
    plansSectionLabel: "4 · Pricing",
    plansPerEventSuffix: "/ event",
    plansDescriptionStrong: "One-time payment per event",
    plansDescriptionRest: "choose a tier when you create the event. Upgrade later if you need more storage, guests, or retention.",
    plansAuroraBubble: "Choose what fits your event now—you can upgrade whenever you need more.",
    plansMascotAlt: "Aurora choosing a storage plan",
    popularBadge: "Popular",
    plans: [
      {
        id: "free",
        name: "Free",
        tailoredFor: "Tailored for small birthdays and dinners",
        rows: [
          { label: "Price", value: "0€" },
          { label: "Guest limit", value: "5" },
          { label: "Photos", value: "20" },
          { label: "Videos", value: "0" },
          { label: "Upload window", value: "Uploads stop 3 days after the event ends" },
          { label: "Event deletion", value: "Deleted 7 days after the event ends" },
          { label: "ZIP export", value: "No" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "Tailored for birthdays and small weddings",
        rows: [
          { label: "Price", value: "15€" },
          { label: "Guest limit", value: "20" },
          { label: "Photos", value: "150" },
          { label: "Videos", value: "10" },
          { label: "Upload window", value: "Uploads stop 7 days after the event ends" },
          { label: "Event deletion", value: "Deleted 14 days after the event ends" },
          { label: "ZIP export", value: "No" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "Tailored for weddings and larger celebrations",
        rows: [
          { label: "Price", value: "30€" },
          { label: "Guest limit", value: "70" },
          { label: "Photos", value: "500" },
          { label: "Videos", value: "50" },
          { label: "Upload window", value: "Uploads stop 14 days after the event ends" },
          { label: "Event deletion", value: "Deleted 30 days after the event ends" },
          { label: "ZIP export", value: "Available to organizers" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Tailored for big weddings, festivals, and multi-day events",
        rows: [
          { label: "Price", value: "60€" },
          { label: "Guest limit", value: "200" },
          { label: "Photos", value: "2000" },
          { label: "Videos", value: "200" },
          { label: "Upload window", value: "Uploads stop 30 days after the event ends" },
          { label: "Event deletion", value: "Deleted 60 days after the event ends" },
          { label: "ZIP export", value: "Available to organizers" },
        ],
      },
    ],
    planFootnote:
      "Fair-use policy applies: a reasonable maximum file size per video is enforced to prevent abuse. Uploads that exceed the per-file size limit will be rejected with a clear error message.",
    lifecycleTitle: "Event lifecycle",
    lifecycleDescription: "Clear rules for uploads, exports, and how long media is kept—aligned with the app.",
    lifecycleRules: [
      "Guests may upload photos and videos until 14 days after the event date.",
      "ZIP export is available to organizers only, starting 24 hours after the event date (paid plans).",
      "All media is automatically deleted after the retention period defined by the chosen plan.",
    ],
    futureTitle: "On the roadmap",
    futureDescription:
      "We're shipping the core experience first. Here's what we're planning next—timelines may change as we learn from early users.",
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
        a: "No. Guests scan the QR code or open the invite link and upload directly from their phone's browser. Nothing to install, ever.",
      },
      {
        q: "Do guests need to create an account?",
        a: "No account and no email required. Guests can optionally add their first name so you know who contributed which photos — that's the most we ask.",
      },
      {
        q: "Are photos uploaded at full quality?",
        a: "We use smart compression so uploads stay fast and reliable. Your photos still look beautiful on phones and the web, while the app keeps everything smooth and snappy.",
      },
      {
        q: "What if a guest uploads something I don't want?",
        a: "You can hide or permanently remove any photo at any time. On paid plans you can enable moderation mode, which holds every upload for your approval before it goes live.",
      },
      {
        q: "How long are photos and videos stored?",
        a: "It depends on your plan — from 7 days on Free to 60 days on Max. On paid plans you can download a full ZIP of originals before the retention period ends.",
      },
    ],
    waitlist: {
      title: "Join the waitlist",
      description:
        "Be first to know when Calisto opens up more broadly. Leave your email—we'll only use it for launch updates.",
      discount: "The first 10 people on the waiting list get 20% off any paid plan (Standard, Premium, or Max).",
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
      "Calisto lets wedding and event guests upload and browse photos and videos in one place. Organizers share a code or QR; plans are one-time per event.",
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
      "Gosti na jednom mjestu učitavaju i gledaju fotografije i videa. Nije potrebno preuzeti aplikaciju, a upload ide i bez korisničkog računa. Pristup je kodom ili QR-om, uz jednokratno plaćanje po događaju.",
    heroAuroraCardBlurb:
      "Želim da budeš na plesu, a ne da u ponedjeljak pretražuješ deset mapi s fotkama. Tu sam da taj neuredno lijepi dan — toaste, prvi ples, taj tren s kolačem — ostane jedna priča koju možeš otvoriti bez detektivskog posla.",
    heroPrimaryCta: "Pridruži se listi čekanja",
    heroSecondaryCta: "Usporedi pakete",
    heroSignals: [
      "Nema preuzimanja aplikacije — gosti skeniraju i učitavaju u pregledniku.",
      "Nije potreban račun, ni za upload u punoj kvaliteti.",
      "Samo organizator vidi, odobrava i dijeli sadržaj.",
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
      { value: "24h", label: "do početka ZIP izvoza" },
    ],
    appPreviewEyebrow: "Izgled aplikacije",
    appPreviewTitlePrefix: "Jedan album.",
    appPreviewTitleEmphasis: "Svaki",
    appPreviewTitleSuffix: "kutak dana.",
    appPreviewMetaLabel: "calisto · organizator",
    appPreviewAriaSection: "Pregled aplikacije",
    appPreviewAriaThumbs: "Minijature snimki zaslona",
    appPreviewCaptions: ["Dobrodošlica", "Pregled galerije", "Preuzimanje", "Popis gostiju"],
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
        title: "ZIP izvoz (plaćeni paketi)",
        description: "Organizatori mogu preuzeti cijeli album kao ZIP, a gosti također ako plate dodatnu uslugu.",
        mascotBubble: "Preuzmi album kad si spreman.",
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
    plansDescriptionStrong: "Jednokratno plaćanje po događaju",
    plansDescriptionRest: "odaberi paket pri kreiranju događaja. Nadogradnja je moguća kasnije za više prostora, gostiju ili dulje čuvanje.",
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
          { label: "Limit gostiju", value: "5" },
          { label: "Fotografije", value: "20" },
          { label: "Videa", value: "0" },
          { label: "Rok uploada", value: "Upload se zatvara 3 dana nakon završetka događaja" },
          { label: "Brisanje događaja", value: "Događaj se briše 7 dana nakon završetka" },
          { label: "ZIP izvoz", value: "Ne" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "Za rođendane i manja vjenčanja",
        rows: [
          { label: "Cijena", value: "15€" },
          { label: "Limit gostiju", value: "20" },
          { label: "Fotografije", value: "150" },
          { label: "Videa", value: "10" },
          { label: "Rok uploada", value: "Upload se zatvara 7 dana nakon završetka događaja" },
          { label: "Brisanje događaja", value: "Događaj se briše 14 dana nakon završetka" },
          { label: "ZIP izvoz", value: "Ne" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "Za vjenčanja i veće proslave",
        rows: [
          { label: "Cijena", value: "30€" },
          { label: "Limit gostiju", value: "70" },
          { label: "Fotografije", value: "500" },
          { label: "Videa", value: "50" },
          { label: "Rok uploada", value: "Upload se zatvara 14 dana nakon završetka događaja" },
          { label: "Brisanje događaja", value: "Događaj se briše 30 dana nakon završetka" },
          { label: "ZIP izvoz", value: "Dostupan organizatorima" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Za velika vjenčanja, festivale i višednevne evente",
        rows: [
          { label: "Cijena", value: "60€" },
          { label: "Limit gostiju", value: "200" },
          { label: "Fotografije", value: "2000" },
          { label: "Videa", value: "200" },
          { label: "Rok uploada", value: "Upload se zatvara 30 dana nakon završetka događaja" },
          { label: "Brisanje događaja", value: "Događaj se briše 60 dana nakon završetka" },
          { label: "ZIP izvoz", value: "Dostupan organizatorima" },
        ],
      },
    ],
    planFootnote:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe. Datoteke koje prelaze limit bit će odbijene uz jasnu poruku.",
    lifecycleTitle: "Životni ciklus događaja",
    lifecycleDescription: "Jasna pravila za upload, izvoz i trajanje pohrane medija — usklađeno s aplikacijom.",
    lifecycleRules: [
      "Gosti mogu učitavati fotografije i videa do 14 dana nakon datuma događaja.",
      "ZIP izvoz dostupan je samo organizatorima od 24 sata nakon datuma događaja (plaćeni paketi).",
      "Sav sadržaj se automatski briše nakon razdoblja čuvanja definiranog paketom.",
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
        a: "Možeš sakriti ili trajno ukloniti svaku fotografiju u bilo koje vrijeme. Na plaćenim paketima možeš uključiti moderaciju koja zadržava sve uploade na tvojem odobrenju.",
      },
      {
        q: "Koliko dugo su fotografije i videa pohranjeni?",
        a: "Ovisi o paketu — od 7 dana na Free do 60 dana na Max. Na plaćenim paketima možeš preuzeti ZIP svih originala prije isteka roka.",
      },
    ],
    waitlist: {
      title: "Pridruži se listi čekanja",
      description: "Ostavi email i saznaj među prvima kad Calisto krene šire.",
      discount: "Prvih 10 na listi dobiva 20% popusta na Standard, Premium ili Max.",
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
      "Calisto omogućuje gostima vjenčanja i događaja da učitavaju i pregledavaju fotografije i videa na jednom mjestu.",
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
    heroTitle: "Ein gemeinsames Album für deine Hochzeit oder dein Event!",
    heroDescription:
      "Calisto hilft Gästen, Fotos und Videos an einem Ort hochzuladen und anzusehen. Kein App-Download nötig, und Uploads funktionieren ohne Konto. Der Zugriff läuft per Code oder QR – mit einmaliger Zahlung pro Event statt Abo.",
    heroAuroraCardBlurb:
      "Lieber tanzt du auf der Feier, als dass du am Montag hundert Chatverläufe durchsuchst. Ich will, dass der Tag als eine lebendige Geschichte bleibt — Reden, Umarmungen, das schiefe Gruppenfoto — die man wiederfindet, ohne Schatzsuche.",
    heroPrimaryCta: "Zur Warteliste",
    heroSecondaryCta: "Tarife vergleichen",
    heroSignals: [
      "Keine App nötig — Gäste scannen und laden im Browser hoch.",
      "Kein Konto erforderlich, auch für Uploads in voller Qualität.",
      "Nur Organisatoren sehen, prüfen und teilen Inhalte.",
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
      { value: "24h", label: "bis ZIP-Export startet" },
    ],
    appPreviewEyebrow: "Sieh es in Aktion",
    appPreviewTitlePrefix: "Ein Album.",
    appPreviewTitleEmphasis: "Jeder",
    appPreviewTitleSuffix: "Moment des Tages.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App-Vorschau",
    appPreviewAriaThumbs: "Screenshot-Vorschau",
    appPreviewCaptions: ["Gast-Begrüßung", "Galerieansicht", "Download", "Gästeliste"],
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
        title: "Sinnvolle Rollen",
        description: "Gäste laden hoch und schauen an; Organisatoren erstellen Events, verwalten Zugriffe und exportieren Archive.",
        mascotBubble: "Die richtigen Rechte für alle.",
      },
      {
        title: "Fotos & Videos je Tarif",
        description: "Starte mit Fotos im Free-Tarif; kostenpflichtige Tarife schalten Videos und höhere Limits frei.",
        mascotBubble: "Passend zu deinem Tarif.",
      },
      {
        title: "ZIP-Export (bezahlte Tarife)",
        description: "Organisatoren können das komplette Album als ZIP herunterladen – je nach Tarif und Zeitpunkt.",
        mascotBubble: "ZIP packen, wenn ihr soweit seid.",
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
        description: "Gäste laden gemeinsam hoch und stöbern. Danach gelten Export- und Aufbewahrungsregeln des Tarifs.",
      },
    ],
    plansTitle: "Tarife",
    plansSectionLabel: "4 · Preise",
    plansPerEventSuffix: "/ Event",
    plansDescriptionStrong: "Einmalige Zahlung pro Event",
    plansDescriptionRest: "wähle einen Tarif beim Erstellen des Events. Späteres Upgrade für mehr Speicher, Gäste oder Aufbewahrung ist möglich.",
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
          { label: "Gästelimit", value: "5" },
          { label: "Fotos", value: "20" },
          { label: "Videos", value: "0" },
          { label: "Upload-Fenster", value: "Uploads enden 3 Tage nach Veranstaltungsende" },
          { label: "Event-Löschung", value: "Event wird 7 Tage nach Ende gelöscht" },
          { label: "ZIP-Export", value: "Nein" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        tailoredFor: "Für Geburtstage und kleinere Hochzeiten",
        rows: [
          { label: "Preis", value: "15€" },
          { label: "Gästelimit", value: "20" },
          { label: "Fotos", value: "150" },
          { label: "Videos", value: "10" },
          { label: "Upload-Fenster", value: "Uploads enden 7 Tage nach Veranstaltungsende" },
          { label: "Event-Löschung", value: "Event wird 14 Tage nach Ende gelöscht" },
          { label: "ZIP-Export", value: "Nein" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        tailoredFor: "Für Hochzeiten und größere Feiern",
        rows: [
          { label: "Preis", value: "30€" },
          { label: "Gästelimit", value: "70" },
          { label: "Fotos", value: "500" },
          { label: "Videos", value: "50" },
          { label: "Upload-Fenster", value: "Uploads enden 14 Tage nach Veranstaltungsende" },
          { label: "Event-Löschung", value: "Event wird 30 Tage nach Ende gelöscht" },
          { label: "ZIP-Export", value: "Für Organisatoren verfügbar" },
        ],
      },
      {
        id: "max",
        name: "Max",
        tailoredFor: "Für große Hochzeiten, Festivals und mehrtägige Events",
        rows: [
          { label: "Preis", value: "60€" },
          { label: "Gästelimit", value: "200" },
          { label: "Fotos", value: "2000" },
          { label: "Videos", value: "200" },
          { label: "Upload-Fenster", value: "Uploads enden 30 Tage nach Veranstaltungsende" },
          { label: "Event-Löschung", value: "Event wird 60 Tage nach Ende gelöscht" },
          { label: "ZIP-Export", value: "Für Organisatoren verfügbar" },
        ],
      },
    ],
    planFootnote:
      "Es gilt eine Fair-Use-Richtlinie: eine angemessene maximale Dateigröße pro Video wird durchgesetzt, um Missbrauch zu verhindern.",
    lifecycleTitle: "Event-Lebenszyklus",
    lifecycleDescription: "Klare Regeln für Uploads, Exporte und Aufbewahrungsdauer – abgestimmt auf die App.",
    lifecycleRules: [
      "Gäste können bis 14 Tage nach dem Eventdatum Fotos und Videos hochladen.",
      "ZIP-Export ist nur für Organisatoren verfügbar, ab 24 Stunden nach dem Eventdatum (bezahlte Tarife).",
      "Alle Medien werden nach Ablauf der tarifabhängigen Aufbewahrungszeit automatisch gelöscht.",
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
        a: "Nein. Gäste scannen den QR-Code oder öffnen den Einladungslink und laden direkt aus dem Browser hoch. Nichts zu installieren.",
      },
      {
        q: "Müssen Gäste ein Konto erstellen?",
        a: "Kein Konto, keine E-Mail erforderlich. Gäste können optional ihren Vornamen angeben, damit du siehst, wer welche Fotos beigetragen hat.",
      },
      {
        q: "Werden Fotos in voller Qualität hochgeladen?",
        a: "Wir nutzen smarte Kompression, damit Uploads schnell und zuverlässig bleiben. Deine Fotos sehen auf dem Handy und im Web weiterhin großartig aus, während die App alles angenehm flüssig hält.",
      },
      {
        q: "Wer kann das Album sehen?",
        a: "Nur du, der Organisator, bis du dich entscheidest zu teilen. Du kannst Gästen jederzeit einen Nur-Lesen-Link senden.",
      },
      {
        q: "Was, wenn ein Gast etwas hochlädt, das ich nicht möchte?",
        a: "Du kannst jedes Foto jederzeit ausblenden oder dauerhaft entfernen. Bei bezahlten Tarifen kannst du den Moderationsmodus aktivieren, der alle Uploads zur Genehmigung zurückhält.",
      },
      {
        q: "Wie lange werden Fotos und Videos gespeichert?",
        a: "Das hängt von deinem Tarif ab — von 7 Tagen beim Free-Tarif bis zu 60 Tagen beim Max-Tarif. Bei bezahlten Tarifen kannst du ein ZIP aller Originale herunterladen.",
      },
    ],
    waitlist: {
      title: "Zur Warteliste",
      description: "Erfahre als Erste oder Erster, wenn Calisto breiter startet. Hinterlasse deine E-Mail für Launch-Updates.",
      discount: "Die ersten 10 Personen auf der Warteliste erhalten 20% Rabatt auf jeden bezahlten Tarif (Standard, Premium oder Max).",
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
      "Calisto hilft Hochzeits- und Eventgästen, Fotos und Videos an einem Ort hochzuladen und zu durchsuchen.",
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
