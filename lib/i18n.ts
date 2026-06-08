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
  goToApp: string;
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
  howDemoCta: string;
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
  plansFormNamePlaceholder: string;
  plansFormDateLabel: string;
  plansFormEmojiPlaceholder: string;
  plansFormChooseBtn: string;
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
  testimonialsSectionLabel: string;
  testimonialsTitle: string;
  testimonials: { quote: string; name: string; event: string }[];
  waitlist: WaitlistCopy;
  footerText: string;
  footerPrivacy: string;
  footerTerms: string;
  legalEnglishNotice: string;
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
    joinWaitlistShort: "Try for free",
    goToApp: "Go to App",
    heroBadge: "Meet Aurora",
    heroIntro: "Hi, I'm Aurora, I'll guide you through Calisto.",
    heroTitle: "Every memory matters. Make sure you capture them all.",
    heroDescription:
      "Calisto is a shared photo and video album for weddings, birthdays, and every celebration. Guests upload straight from their phone browser. No app to download. Free to try.",
    heroAuroraCardBlurb:
      "I'd rather you be in the moment than digging through camera rolls on Monday. I'm here so the messy, wonderful parts of your day—the toasts, the candid grins, the kid with cake on his face—stay in one story you can reopen without a scavenger hunt.",
    heroPrimaryCta: "Try for free",
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
      { value: "50+ weddings", label: "already celebrated" },
      { value: "1,000+ photos", label: "captured and shared" },
      { value: "500+ guests", label: "no app, no account" },
    ],
    appPreviewEyebrow: "See it in action",
    appPreviewTitlePrefix: "One album.",
    appPreviewTitleEmphasis: "Every",
    appPreviewTitleSuffix: "angle of the day.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App preview",
    appPreviewAriaThumbs: "Screenshot thumbnails",
    appPreviewCaptions: ["Welcome", "Home", "Gallery", "Event home"],
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
        title: "One code for your event",
        description: "Each event gets its own code — like WEDDING2026. Share it and guests are in instantly.",
        mascotBubble: "Your event, your code—simple.",
      },
      {
        title: "Share by link, QR, or code",
        description: "Send a link, display a QR code, or just text the code. Guests join from their phone in seconds — no app needed.",
        mascotBubble: "Scan or tap—they're in!",
      },
      {
        title: "Everyone sees it live",
        description:
          "Every photo and video shows up for all guests the moment it's uploaded — like a shared camera roll for your whole event.",
        mascotBubble: "One gallery, all the magic.",
      },
      {
        title: "You stay in control",
        description: "You manage the event while guests just upload and browse. No complicated setup for anyone.",
        mascotBubble: "Right people, right access.",
      },
      {
        title: "Start free, add more when you need",
        description:
          "Photos are free for every event. Upgrade to add videos, more guests, and a longer window to upload after the day.",
        mascotBubble: "I'll match the plan to your story.",
      },
      {
        title: "Download everything at once",
        description:
          "When the celebration's over, grab every photo and video in a single download. We'll email you when it's ready.",
        mascotBubble: "Whole album, one download.",
      },
      {
        title: "Approve photos before they go live",
        description:
          "Turn on photo moderation and every guest upload lands in a private review queue first. Approve what belongs, discard what doesn't — guests only see what you allow.",
        mascotBubble: "You decide what the gallery shows.",
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
    howDemoCta: "Try the demo",
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
    plansDescriptionStrong: "Choose the plan that fits your event",
    plansDescriptionRest:
      "guest caps, media quotas, and upload windows follow the tier you pick. Raising or lowering a tier in Settings updates limits in the app.",
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
          { label: "Download all", value: "Gallery — primary organizer, 24h link" },
          { label: "Guests can upload for", value: "3 days" },
          { label: "Photos kept for", value: "7 days" },
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
          { label: "Download all", value: "Gallery — primary organizer, 24h link" },
          { label: "Guests can upload for", value: "7 days" },
          { label: "Photos kept for", value: "30 days" },
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
          { label: "Download all", value: "Gallery — primary organizer, 24h link" },
          { label: "Guests can upload for", value: "14 days" },
          { label: "Photos kept for", value: "90 days" },
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
          { label: "Download all", value: "Gallery — primary organizer, 24h link" },
          { label: "Guests can upload for", value: "30 days" },
          { label: "Photos kept for", value: "180 days" },
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
          { label: "Download all", value: "Gallery — primary organizer, 24h link" },
          { label: "Guests can upload for", value: "60 days" },
          { label: "Photos kept for", value: "365 days" },
        ],
      },
    ],
    planFootnote:
      "Fair-use policy applies: a reasonable maximum file size per video is enforced to prevent abuse. Uploads that exceed the per-file size limit will be rejected with a clear error message.",
    plansFormNamePlaceholder: "Event name",
    plansFormDateLabel: "Date",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Choose",
    lifecycleTitle: "Event lifecycle",
    lifecycleDescription: "What the Calisto web app does today vs what ships next — including scheduled event teardown.",
    lifecycleRules: [
      "Guest upload windows are enforced in-app based on plan tier (`uploadDaysAfterEvent`, from 3 days on Free through 60 days on Max).",
      "Each event has a `scheduled_deletion_at` from the event date plus plan retention (7 / 30 / 90 / 180 / 365 days). An hourly job removes due events and their media unless the organizer deletes them first in Settings.",
      "Primary organizers can export the gallery as a ZIP from the app (async job, 24-hour download window).",
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
        a: "Organizers delete individual photos or videos from the gallery anytime. Dedicated moderation queues are on the roadmap.",
      },
      {
        q: "How long are photos and videos stored?",
        a: "After the event date, the whole album is automatically removed when your plan’s retention ends (7 to 365 days from the event date). You can delete earlier anytime in Settings.",
      },
    ],
    testimonialsSectionLabel: "What people say",
    testimonialsTitle: "Trusted at real events",
    testimonials: [
      {
        quote: "We had 90 guests uploading all night. By midnight the album had 340 photos and nobody had to share a single WhatsApp message.",
        name: "Ana & Marko",
        event: "Wedding, Zagreb",
      },
      {
        quote: "Set it up in under a minute. My parents were uploading from their phones without asking me for help once.",
        name: "Luka T.",
        event: "Family reunion",
      },
      {
        quote: "The QR code on the table was the best idea. Everyone scanned it, even my grandmother.",
        name: "Sara M.",
        event: "Birthday party",
      },
    ],
    waitlist: {
      title: "Try for free.",
      description:
        "Create your event in minutes. Enter the details, choose a plan — free or paid — and you're ready to go. Sign up only when you're ready to confirm.",
      discount: "The first 10 people on the waiting list get 20% off any paid plan (Standard, Plus, Premium, or Max).",
      submitted: "You're on the list—we'll be in touch.",
      submitFailed: "Could not join the waitlist right now. Please try again in a moment.",
      inputLabel: "Email",
      inputPlaceholder: "you@example.com",
      invalidEmail: "Enter a valid email address.",
      buttonIdle: "Try for free",
      buttonBusy: "Joining...",
      note: "Discount details and eligibility may be updated before launch. No spam—unsubscribe anytime once we send real emails.",
    },
    footerText: "Event media for weddings and celebrations. Questions? Join the waitlist—we'll reach out.",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    legalEnglishNotice: "",
    pageTitle: "Calisto — shared event photos & videos",
    pageDescription:
      "Calisto lets wedding and event guests upload and browse photos and videos together. Share a join code or QR — no app, no account needed for guests.",
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
    joinWaitlistShort: "Isprobaj besplatno",
    goToApp: "Idi u aplikaciju",
    heroBadge: "Upoznaj Auroru",
    heroIntro: "Bok, ja sam Aurora, predstavljam ti Calisto.",
    heroTitle: "Svaka uspomena je važna. Pobrinite se da ne propustite nijednu.",
    heroDescription:
      "Calisto je zajednički foto i video album za vjenčanja, rođendane i proslave. Gosti dijele slike izravno iz preglednika na mobitelu. Nema preuzimanja aplikacije. Isprobaj besplatno.",
    heroAuroraCardBlurb:
      "Želim da budeš na plesu, a ne da u ponedjeljak pretražuješ deset mapi s fotkama. Tu sam da taj neuredno lijepi dan — toaste, prvi ples, taj tren s kolačem — ostane jedna priča koju možeš otvoriti bez detektivskog posla.",
    heroPrimaryCta: "Isprobaj besplatno",
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
      { value: "50+ vjenčanja", label: "već proslavljena" },
      { value: "1.000+ fotografija", label: "snimljeno i podijeljeno" },
      { value: "500+ gostiju", label: "bez aplikacije i računa" },
    ],
    appPreviewEyebrow: "Izgled aplikacije",
    appPreviewTitlePrefix: "Jedan album.",
    appPreviewTitleEmphasis: "Svaki",
    appPreviewTitleSuffix: "kutak dana.",
    appPreviewMetaLabel: "calisto · organizator",
    appPreviewAriaSection: "Pregled aplikacije",
    appPreviewAriaThumbs: "Minijature snimki zaslona",
    appPreviewCaptions: ["Dobrodošlica", "Početna", "Galerija", "Početna događaja"],
    appPreviewViewAriaTemplate: "Pogledaj: {name}",
    appPreviewImageAltTemplate: "Calisto aplikacija — {name}",
    featuresTitle: "Što sve uključuje",
    featuresSectionLabel: "2 · Mogućnosti",
    featuresDescription: "Za dane kad svi fotografiraju — uploadovi ostaju uredni i lako dijeljivi.",
    featuresAuroraBubble:
      "Svaki gost učitava u jednu galeriju — pomažem da sve ostane uredno.",
    features: [
      {
        title: "Jedan kod za tvoj događaj",
        description: "Svaki događaj dobiva vlastiti kod — poput WEDDING2026. Podijeli ga i gosti su odmah unutra.",
        mascotBubble: "Tvoj događaj, tvoj kod—lako.",
      },
      {
        title: "Podijeli linkom, QR-om ili kodom",
        description: "Pošalji link, prikaži QR kod ili samo pošalji kod porukom. Gosti se pridružuju s mobitela za nekoliko sekundi — bez aplikacije.",
        mascotBubble: "Skeniraj ili dodirni—ulaze odmah!",
      },
      {
        title: "Svi vide uživo",
        description:
          "Svaka fotografija i video pojavljuju se svim gostima čim se učitaju — kao zajednički foto-album za cijeli događaj.",
        mascotBubble: "Jedna galerija, svi u istom trenu.",
      },
      {
        title: "Ti si uvijek u kontroli",
        description: "Ti upravljaš događajem, a gosti samo učitavaju i pregledavaju. Bez kompliciranog postavljanja ni za koga.",
        mascotBubble: "Pravi ljudi, pravi pristup.",
      },
      {
        title: "Počni besplatno, dodaj više kad zatreba",
        description:
          "Fotografije su besplatne za svaki događaj. Nadogradi za videa, više gostiju i dulje razdoblje učitavanja nakon dana.",
        mascotBubble: "Paket uskladim s pričom.",
      },
      {
        title: "Preuzmi sve odjednom",
        description:
          "Kad proslava završi, preuzmi sve fotografije i videozapise u jednom preuzimanju. Javit ćemo ti se emailom kad bude spreman.",
        mascotBubble: "Cijeli album u jednom preuzimanju.",
      },
      {
        title: "Odobri fotografije prije objave",
        description:
          "Uključi moderiranje i svaki gostov upload završi u privatnom redu čekanja. Odobri što spada, odbaci što ne spada — gosti vide samo ono što ti pustiš.",
        mascotBubble: "Ti odlučuješ što galerija prikazuje.",
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
    howDemoCta: "Isprobaj demo",
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
    plansDescriptionStrong: "Odaberi paket koji odgovara tvom događaju",
    plansDescriptionRest:
      "kapaciteti, upload prozori i videi definiraju se paketom. U Postavkama događaja možeš promijeniti paket unutar aplikacije.",
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
          { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
          { label: "Gosti mogu učitavati još", value: "3 dana" },
          { label: "Fotografije čuvamo", value: "7 dana" },
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
          { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
          { label: "Gosti mogu učitavati još", value: "7 dana" },
          { label: "Fotografije čuvamo", value: "30 dana" },
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
          { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
          { label: "Gosti mogu učitavati još", value: "14 dana" },
          { label: "Fotografije čuvamo", value: "90 dana" },
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
          { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
          { label: "Gosti mogu učitavati još", value: "30 dana" },
          { label: "Fotografije čuvamo", value: "180 dana" },
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
          { label: "Preuzmi sve", value: "Galerija — primarni organizator, 24h link" },
          { label: "Gosti mogu učitavati još", value: "60 dana" },
          { label: "Fotografije čuvamo", value: "365 dana" },
        ],
      },
    ],
    planFootnote:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe. Datoteke koje prelaze limit bit će odbijene uz jasnu poruku.",
    plansFormNamePlaceholder: "Naziv događaja",
    plansFormDateLabel: "Datum",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Odaberi",
    lifecycleTitle: "Životni ciklus događaja",
    lifecycleDescription: "Što radi web aplikacija danas naspram što slijedi — uključujući zakazano uklanjanje događaja.",
    lifecycleRules: [
      "Gosti mogu učitavati još neko vrijeme nakon datuma događaja — koliko dugo ovisi o paketu (od 3 dana na Free do 60 dana na Max).",
      "Svaki događaj ima `scheduled_deletion_at` od datuma događaja plus zadržavanje paketa (7 / 30 / 90 / 180 / 365 dana). Satni posao uklanja dospjele događaje i medije osim ako organizator prije obriše u Postavkama.",
      "Primarni organizator može iz aplikacije izvesti galeriju kao ZIP (asinkroni posao, 24 sata za preuzimanje).",
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
        a: "Organizator u bilo kojem trenutku može obrisati pojedinačne fotografije ili videa iz galerije. Posebni moderacijski redovi su na roadmapu.",
      },
      {
        q: "Koliko dugo su fotografije i videa pohranjeni?",
        a: "Nakon datuma događaja, cijeli album se automatski uklanja kad istekne zadržavanje tvog paketa (7 do 365 dana). Možeš sve ranije obrisati u Postavkama.",
      },
    ],
    testimonialsSectionLabel: "Što kažu korisnici",
    testimonialsTitle: "Provjereno na pravim događajima",
    testimonials: [
      {
        quote: "Imali smo 90 gostiju koji su cijelu noć učitavali slike. Do ponoći je album imao 340 fotografija i nitko nije morao slati niti jednu WhatsApp poruku.",
        name: "Ana & Marko",
        event: "Vjenčanje, Zagreb",
      },
      {
        quote: "Postavio sam sve za manje od minute. Roditelji su učitavali s mobitela bez da su me jednom pitali za pomoć.",
        name: "Luka T.",
        event: "Obiteljsko okupljanje",
      },
      {
        quote: "QR kod na stolu bila je izvrsna ideja. Svi su ga skenirali, čak i moja baka.",
        name: "Sara M.",
        event: "Rođendanska proslava",
      },
    ],
    waitlist: {
      title: "Isprobaj besplatno.",
      description:
        "Kreirajte događaj za nekoliko minuta. Unesite detalje, odaberite paket — besplatni ili plaćeni — i krenite. Prijava samo kad ste spremni potvrditi.",
      discount: "Prvih 10 na listi dobiva 20% popusta na bilo koji plaćeni paket (Standard, Plus, Premium ili Max).",
      submitted: "Na listi si — javimo ti se uskoro.",
      submitFailed: "Trenutno se ne možeš prijaviti na listu čekanja. Pokušaj ponovno za trenutak.",
      inputLabel: "Email",
      inputPlaceholder: "ti@primjer.com",
      invalidEmail: "Unesi valjanu email adresu.",
      buttonIdle: "Isprobaj besplatno",
      buttonBusy: "Prijava...",
      note: "Detalji popusta i uvjeti mogu se promijeniti prije lansiranja. Bez spama — odjava je uvijek moguća.",
    },
    footerText: "Calisto za vjenčanja i proslave. Imaš pitanje? Pridruži se listi čekanja.",
    footerPrivacy: "Privatnost",
    footerTerms: "Uvjeti",
    legalEnglishNotice: "Pravni tekst na ovoj stranici dostupan je na engleskom jeziku.",
    pageTitle: "Calisto — zajedničke fotografije i videa događaja",
    pageDescription:
      "Calisto gostima omogućuje učitavanje i pregled fotografija i videa na jednom mjestu. Podijeli kod ili QR — bez aplikacije i računa za goste.",
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
    joinWaitlistShort: "Kostenlos ausprobieren",
    goToApp: "Zur App",
    heroBadge: "Lerne Aurora kennen",
    heroIntro: "Hi, ich bin Aurora, ich stelle dir Calisto vor.",
    heroTitle: "Jede Erinnerung zählt. Stell sicher, dass du sie alle festhältst.",
    heroDescription:
      "Calisto ist das gemeinsame Foto- und Videoalbum für Hochzeiten, Geburtstage und jede Feier. Gäste laden direkt im Handy-Browser hoch. Keine App nötig. Kostenlos ausprobieren.",
    heroAuroraCardBlurb:
      "Lieber tanzt du auf der Feier, als dass du am Montag hundert Chatverläufe durchsuchst. Ich will, dass der Tag als eine lebendige Geschichte bleibt — Reden, Umarmungen, das schiefe Gruppenfoto — die man wiederfindet, ohne Schatzsuche.",
    heroPrimaryCta: "Kostenlos ausprobieren",
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
      { value: "50+ Hochzeiten", label: "bereits gefeiert" },
      { value: "1.000+ Fotos", label: "aufgenommen und geteilt" },
      { value: "500+ Gäste", label: "ohne App, ohne Konto" },
    ],
    appPreviewEyebrow: "Sieh es in Aktion",
    appPreviewTitlePrefix: "Ein Album.",
    appPreviewTitleEmphasis: "Jeder",
    appPreviewTitleSuffix: "Augenblick des Tages.",
    appPreviewMetaLabel: "calisto · organizer",
    appPreviewAriaSection: "App-Vorschau",
    appPreviewAriaThumbs: "Screenshot-Vorschau",
    appPreviewCaptions: ["Willkommen", "Startseite", "Galerie", "Event-Startseite"],
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
        title: "Ein Code für dein Event",
        description: "Jedes Event bekommt seinen eigenen Code — z. B. WEDDING2026. Teile ihn und Gäste sind sofort dabei.",
        mascotBubble: "Dein Event, dein Code—so einfach.",
      },
      {
        title: "Per Link, QR-Code oder Code teilen",
        description: "Schicke einen Link, zeige einen QR-Code oder sende einfach den Code. Gäste treten vom Handy bei — keine App nötig.",
        mascotBubble: "Scannen oder tippen—fertig!",
      },
      {
        title: "Alle sehen es live",
        description:
          "Jedes Foto und Video erscheint bei allen Gästen sofort nach dem Hochladen — wie ein gemeinsamer Fotoordner für dein ganzes Event.",
        mascotBubble: "Eine Galerie, alle im gleichen Takt.",
      },
      {
        title: "Du behältst die Kontrolle",
        description: "Du verwaltest das Event, während Gäste einfach hochladen und stöbern. Kein kompliziertes Setup für niemanden.",
        mascotBubble: "Die richtigen Leute, der richtige Zugang.",
      },
      {
        title: "Kostenlos starten, bei Bedarf erweitern",
        description:
          "Fotos sind bei jedem Event kostenlos. Upgrade für Videos, mehr Gäste und ein längeres Upload-Fenster nach dem Event.",
        mascotBubble: "Ich passe den Tarif an eure Geschichte an.",
      },
      {
        title: "Alles auf einmal herunterladen",
        description:
          "Wenn die Feier vorbei ist, lade alle Fotos und Videos in einem Rutsch herunter. Wir schicken dir eine E-Mail, sobald alles bereit ist.",
        mascotBubble: "Ganzes Album, ein Download.",
      },
      {
        title: "Fotos vor der Veröffentlichung freigeben",
        description:
          "Aktiviere die Foto-Moderation und jeder Gäste-Upload landet zuerst in einer privaten Warteschlange. Freigeben was passt, verwerfen was nicht passt — Gäste sehen nur, was du erlaubst.",
        mascotBubble: "Du entscheidest, was die Galerie zeigt.",
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
    howDemoCta: "Demo ausprobieren",
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
    plansDescriptionStrong: "Wähle den Tarif, der zu deinem Event passt",
    plansDescriptionRest:
      "Gästelimits, Mediakontingente und Upload-Fenster richten sich nach der gewählten Stufe. In den Event-Einstellungen kannst du den Tarif ändern, um die Limits in der App anzupassen.",
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
          { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
          { label: "Gäste können hochladen für", value: "3 Tage" },
          { label: "Fotos gespeichert für", value: "7 Tage" },
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
          { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
          { label: "Gäste können hochladen für", value: "7 Tage" },
          { label: "Fotos gespeichert für", value: "30 Tage" },
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
          { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
          { label: "Gäste können hochladen für", value: "14 Tage" },
          { label: "Fotos gespeichert für", value: "90 Tage" },
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
          { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
          { label: "Gäste können hochladen für", value: "30 Tage" },
          { label: "Fotos gespeichert für", value: "180 Tage" },
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
          { label: "Alles herunterladen", value: "Galerie — Primär, 24h-Link" },
          { label: "Gäste können hochladen für", value: "60 Tage" },
          { label: "Fotos gespeichert für", value: "365 Tage" },
        ],
      },
    ],
    planFootnote:
      "Fair-Use gilt: zur Missbrauchsprävention wird eine angemessene maximale Dateigröße pro Video durchgesetzt. Uploads über dem Limit werden mit einer klaren Fehlermeldung abgewiesen.",
    plansFormNamePlaceholder: "Veranstaltungsname",
    plansFormDateLabel: "Datum",
    plansFormEmojiPlaceholder: "Emoji",
    plansFormChooseBtn: "Auswählen",
    lifecycleTitle: "Event-Lebenszyklus",
    lifecycleDescription: "Was die Calisto-Web-App heute schon tut und was später kommt — inklusive geplanter Event-Bereinigung.",
    lifecycleRules: [
      "Nach dem Eventdatum dürfen Gäste noch begrenzt hochladen — wie lange, hängt vom Tarif ab (von 3 Tagen beim Free-Tarif bis 60 Tagen bei Max).",
      "Jedes Event hat ein `scheduled_deletion_at` aus Eventdatum plus Tarif-Aufbewahrung (7 / 30 / 90 / 180 / 365 Tage). Ein stündlicher Job entfernt fällige Events und Medien, sofern Organisator:innen nicht zuvor in den Einstellungen löschen.",
      "Primär-Organisator:innen können die Galerie als ZIP aus der App exportieren (asynchroner Job, 24 Stunden Download-Fenster).",
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
        a: "Organisator:innen löschen einzelne Fotos oder Videos jederzeit aus der Galerie. Eigene Moderationswarteschlangen sind auf der Roadmap.",
      },
      {
        q: "Wie lange werden Fotos und Videos gespeichert?",
        a: "Nach dem Eventdatum wird das gesamte Album automatisch entfernt, wenn die Aufbewahrung deines Tarifs endet (7 bis 365 Tage). Du kannst jederzeit früher in den Einstellungen löschen.",
      },
    ],
    testimonialsSectionLabel: "Was andere sagen",
    testimonialsTitle: "Bewährt bei echten Events",
    testimonials: [
      {
        quote: "Wir hatten 90 Gäste, die die ganze Nacht hochgeladen haben. Um Mitternacht hatte das Album 340 Fotos – ohne eine einzige WhatsApp-Nachricht.",
        name: "Ana & Marko",
        event: "Hochzeit, Zagreb",
      },
      {
        quote: "In unter einer Minute eingerichtet. Meine Eltern haben vom Handy hochgeladen, ohne mich einmal um Hilfe zu bitten.",
        name: "Luka T.",
        event: "Familientreffen",
      },
      {
        quote: "Der QR-Code auf dem Tisch war die beste Idee. Alle haben ihn gescannt – sogar meine Oma.",
        name: "Sara M.",
        event: "Geburtstagsfeier",
      },
    ],
    waitlist: {
      title: "Kostenlos ausprobieren.",
      description:
        "Erstelle dein Event in wenigen Minuten. Gib die Details ein, wähle einen Tarif — kostenlos oder kostenpflichtig — und du kannst loslegen. Anmeldung erst beim Bestätigen.",
      discount: "Die ersten 10 Personen auf der Warteliste erhalten 20% Rabatt auf jeden bezahlten Tarif (Standard, Plus, Premium oder Max).",
      submitted: "Du bist auf der Liste – wir melden uns bald.",
      submitFailed: "Ein Eintrag in die Warteliste ist gerade nicht möglich. Bitte versuche es gleich noch einmal.",
      inputLabel: "E-Mail",
      inputPlaceholder: "du@beispiel.de",
      invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
      buttonIdle: "Kostenlos ausprobieren",
      buttonBusy: "Wird eingetragen...",
      note: "Rabattdetails und Teilnahmebedingungen können vor dem Launch angepasst werden. Kein Spam.",
    },
    footerText: "Event-Medien für Hochzeiten und Feiern. Fragen? Trag dich in die Warteliste ein.",
    footerPrivacy: "Datenschutz",
    footerTerms: "AGB",
    legalEnglishNotice: "Der Rechtstext auf dieser Seite liegt auf Englisch vor.",
    pageTitle: "Calisto — gemeinsame Event-Fotos & Videos",
    pageDescription:
      "Calisto lässt Hochzeits- und Eventgäste Fotos und Videos gemeinsam hochladen und ansehen. Code oder QR teilen — keine App und kein Konto für Gäste nötig.",
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
