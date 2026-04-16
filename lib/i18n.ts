export type Locale = "en" | "hr" | "de";

type NavItem = {
  href: string;
  label: string;
};

type Feature = {
  title: string;
  description: string;
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
  rows: PlanRow[];
};

type FutureItem = {
  title: string;
  description: string;
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
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  statBar: { value: string; label: string }[];
  appPreviewEyebrow: string;
  appPreviewAriaSection: string;
  appPreviewAriaThumbs: string;
  appPreviewCaptions: readonly [string, string, string];
  appPreviewViewAriaTemplate: string;
  appPreviewImageAltTemplate: string;
  featuresTitle: string;
  featuresDescription: string;
  featuresAuroraBubble: string;
  features: Feature[];
  howTitle: string;
  howDescription: string;
  howItems: HowItWorksItem[];
  plansTitle: string;
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
  waitlist: WaitlistCopy;
  footerText: string;
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
      { href: "#features", label: "Features" },
      { href: "#plans", label: "Plans" },
      { href: "#future", label: "Future" },
      { href: "#waitlist", label: "Waitlist" },
    ],
    joinWaitlistShort: "Join waitlist",
    heroBadge: "Meet Aurora",
    heroIntro: "Hi, I'm Aurora — I'll guide you through Calisto.",
    heroTitle: "One shared album for your wedding or event—guests join with a code, you stay in control.",
    heroDescription:
      "Calisto helps your guests upload and browse photos and videos in one place. I'll help you keep memories organized with a simple access code, optional QR invite, and storage plans that match your celebration—priced once per event, not as a monthly subscription.",
    heroPrimaryCta: "Join the waitlist",
    heroSecondaryCta: "Compare plans",
    statBar: [
      { value: "50+", label: "guests on Free plan" },
      { value: "100 GB", label: "max storage available" },
      { value: "3", label: "steps to your gallery" },
    ],
    appPreviewEyebrow: "See it in action",
    appPreviewAriaSection: "App preview",
    appPreviewAriaThumbs: "Screenshot thumbnails",
    appPreviewCaptions: ["Gallery view", "Event details", "Upload flow"],
    appPreviewViewAriaTemplate: "View {name}",
    appPreviewImageAltTemplate: "Calisto app — {name}",
    featuresTitle: "What you can do",
    featuresDescription:
      "Built for big days when everyone is taking pictures—Calisto keeps uploads organized and easy to share.",
    featuresAuroraBubble:
      "Every guest upload lands in one gallery—I'll help you keep it tidy.",
    features: [
      {
        title: "Unique access code",
        description:
          "Each event has its own code (for example WEDDING2026). Guests use it to join—no complicated setup.",
      },
      {
        title: "Invite links & QR",
        description: "Share a link or show a QR code so guests can join the album quickly from their phones.",
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
        description: "Organizers can download the full album as a ZIP after the event—timing depends on your plan.",
      },
    ],
    howTitle: "How it works",
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
    plansDescriptionStrong: "One-time payment per event",
    plansDescriptionRest: "choose a tier when you create the event. Upgrade later if you need more storage, guests, or retention.",
    plansAuroraBubble: "Choose what fits your event now—you can upgrade whenever you need more.",
    plansMascotAlt: "Aurora choosing a storage plan",
    popularBadge: "Popular",
    plans: [
      {
        id: "free",
        name: "Free",
        rows: [
          { label: "Price", value: "0€" },
          { label: "Storage", value: "1 GB" },
          { label: "Photos", value: "Yes" },
          { label: "Videos", value: "No" },
          { label: "Retention", value: "1 month after event date" },
          { label: "Guest limit", value: "50" },
          { label: "ZIP export", value: "No" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        rows: [
          { label: "Price", value: "15€" },
          { label: "Storage", value: "5 GB" },
          { label: "Photos", value: "Yes" },
          { label: "Videos", value: "Up to 20 videos, max 30 sec each" },
          { label: "Retention", value: "3 months after event date" },
          { label: "Guest limit", value: "150" },
          { label: "ZIP export", value: "Organizers only, from 24 h after event date" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        rows: [
          { label: "Price", value: "25€" },
          { label: "Storage", value: "20 GB" },
          { label: "Photos", value: "Yes" },
          { label: "Videos", value: "Up to 100 videos, max 60 sec each" },
          { label: "Retention", value: "6 months after event date" },
          { label: "Guest limit", value: "350" },
          { label: "ZIP export", value: "Organizers only, from 24 h after event date" },
        ],
      },
      {
        id: "max",
        name: "Max",
        rows: [
          { label: "Price", value: "50€" },
          { label: "Storage", value: "100 GB" },
          { label: "Photos", value: "Yes" },
          { label: "Videos", value: "Unlimited videos, max 180 sec each" },
          { label: "Retention", value: "12 months after event date" },
          { label: "Guest limit", value: "800" },
          { label: "ZIP export", value: "Organizers only, from 24 h after event + full archive" },
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
      { href: "#features", label: "Mogućnosti" },
      { href: "#plans", label: "Paketi" },
      { href: "#future", label: "Budućnost" },
      { href: "#waitlist", label: "Lista čekanja" },
    ],
    joinWaitlistShort: "Pridruži se listi",
    heroBadge: "Upoznaj Auroru",
    heroIntro: "Bok, ja sam Aurora — predstavljam ti Calisto.",
    heroTitle: "Jedan zajednički album za tvoje vjenčanje ili događaj — gosti se pridružuju kodom, a ti zadržavaš kontrolu.",
    heroDescription:
      "Calisto omogućuje tvojim gostima da na jednom mjestu učitavaju i pregledavaju fotografije i videa. Pomažem ti da uspomene ostanu organizirane uz jednostavan pristupni kod, opcionalni QR poziv i pakete pohrane prema veličini događaja — jednokratno plaćanje po događaju, bez mjesečne pretplate.",
    heroPrimaryCta: "Pridruži se listi čekanja",
    heroSecondaryCta: "Usporedi pakete",
    statBar: [
      { value: "50+", label: "gostiju na Free paketu" },
      { value: "100 GB", label: "maks. dostupna pohrana" },
      { value: "3", label: "koraka do galerije" },
    ],
    appPreviewEyebrow: "Vidi kako radi",
    appPreviewAriaSection: "Pregled aplikacije",
    appPreviewAriaThumbs: "Minijature snimki zaslona",
    appPreviewCaptions: ["Pregled galerije", "Detalji događaja", "Tok učitavanja"],
    appPreviewViewAriaTemplate: "Pogledaj: {name}",
    appPreviewImageAltTemplate: "Calisto aplikacija — {name}",
    featuresTitle: "Što možeš raditi",
    featuresDescription: "Stvoreno za velike dane kada svi fotografiraju — Calisto drži uploadove organiziranima i lakima za dijeljenje.",
    featuresAuroraBubble:
      "Svaki gost učitava u jednu galeriju — pomažem da sve ostane uredno.",
    features: [
      {
        title: "Jedinstveni pristupni kod",
        description: "Svaki događaj ima svoj kod (npr. WEDDING2026). Gosti se uključuju bez kompliciranog setupa.",
      },
      {
        title: "Pozivni linkovi i QR",
        description: "Podijeli link ili pokaži QR kod da se gosti brzo pridruže albumu s mobitela.",
      },
      {
        title: "Zajednička galerija",
        description: "Svi vide istu kolekciju u stvarnom vremenu dok stižu fotografije i videa — idealno za vjenčanja i proslave.",
      },
      {
        title: "Uloge koje imaju smisla",
        description: "Gosti učitavaju i pregledavaju, organizatori kreiraju događaje, upravljaju pristupom i (na plaćenim paketima) izvoze arhivu.",
      },
      {
        title: "Fotografije i videa po paketu",
        description: "Kreni s fotografijama na Free paketu; plaćeni paketi otključavaju videa, veće limite i duže čuvanje.",
      },
      {
        title: "ZIP izvoz (plaćeni paketi)",
        description: "Organizatori mogu preuzeti cijeli album kao ZIP nakon događaja — dostupnost ovisi o paketu.",
      },
    ],
    howTitle: "Kako radi",
    howDescription: "Tri koraka od praznog albuma do zajedničkih uspomena.",
    howItems: [
      {
        step: "1",
        title: "Kreiraj događaj",
        description: "Odaberi naziv, datum i paket pohrane. Automatski postaješ organizator.",
      },
      {
        step: "2",
        title: "Podijeli kod ili QR",
        description: "Pošalji gostima pristupni kod, pozivni link ili ih pusti da skeniraju QR.",
      },
      {
        step: "3",
        title: "Skupljaj i uživaj",
        description: "Gosti zajedno učitavaju i pregledavaju sadržaj. Nakon događaja vrijede pravila tvog paketa.",
      },
    ],
    plansTitle: "Paketi",
    plansDescriptionStrong: "Jednokratno plaćanje po događaju",
    plansDescriptionRest: "odaberi paket pri kreiranju događaja. Nadogradnja je moguća kasnije ako trebaš više prostora, gostiju ili duže čuvanje.",
    plansAuroraBubble: "Odaberi što sada odgovara tvom događaju — nadogradnja je uvijek opcija.",
    plansMascotAlt: "Aurora bira paket pohrane",
    popularBadge: "Najpopularniji",
    plans: [
      {
        id: "free",
        name: "Free",
        rows: [
          { label: "Cijena", value: "0€" },
          { label: "Pohrana", value: "1 GB" },
          { label: "Fotografije", value: "Da" },
          { label: "Videa", value: "Ne" },
          { label: "Čuvanje", value: "1 mjesec nakon datuma događaja" },
          { label: "Limit gostiju", value: "50" },
          { label: "ZIP izvoz", value: "Ne" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        rows: [
          { label: "Cijena", value: "15€" },
          { label: "Pohrana", value: "5 GB" },
          { label: "Fotografije", value: "Da" },
          { label: "Videa", value: "Do 20 videa, max 30 sekundi" },
          { label: "Čuvanje", value: "3 mjeseca nakon datuma događaja" },
          { label: "Limit gostiju", value: "150" },
          { label: "ZIP izvoz", value: "Samo organizatori, od 24 h nakon događaja" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        rows: [
          { label: "Cijena", value: "25€" },
          { label: "Pohrana", value: "20 GB" },
          { label: "Fotografije", value: "Da" },
          { label: "Videa", value: "Do 100 videa, max 60 sekundi" },
          { label: "Čuvanje", value: "6 mjeseci nakon datuma događaja" },
          { label: "Limit gostiju", value: "350" },
          { label: "ZIP izvoz", value: "Samo organizatori, od 24 h nakon događaja" },
        ],
      },
      {
        id: "max",
        name: "Max",
        rows: [
          { label: "Cijena", value: "50€" },
          { label: "Pohrana", value: "100 GB" },
          { label: "Fotografije", value: "Da" },
          { label: "Videa", value: "Neograničeno videa, max 180 sekundi" },
          { label: "Čuvanje", value: "12 mjeseci nakon datuma događaja" },
          { label: "Limit gostiju", value: "800" },
          { label: "ZIP izvoz", value: "Samo organizatori, od 24 h nakon događaja + puna arhiva" },
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
    waitlist: {
      title: "Pridruži se listi čekanja",
      description: "Budi među prvima koji će saznati kad Calisto krene šire. Ostavi email za novosti o lansiranju.",
      discount: "Prvih 10 ljudi na listi čekanja dobiva 20% popusta na bilo koji plaćeni paket (Standard, Premium ili Max).",
      submitted: "Na listi si — javimo ti se uskoro.",
      submitFailed: "Trenutno se ne možeš prijaviti na listu čekanja. Pokušaj ponovno za trenutak.",
      inputLabel: "Email",
      inputPlaceholder: "ti@primjer.com",
      invalidEmail: "Unesi valjanu email adresu.",
      buttonIdle: "Pridruži se listi čekanja",
      buttonBusy: "Prijava...",
      note: "Detalji popusta i uvjeti mogu se promijeniti prije lansiranja. Bez spama — možeš se odjaviti kad god poželiš.",
    },
    footerText: "Event media za vjenčanja i proslave. Imaš pitanja? Pridruži se listi čekanja i javimo ti se.",
    pageTitle: "Calisto — zajedničke fotografije i videa događaja",
    pageDescription:
      "Calisto omogućuje gostima vjenčanja i događaja da učitavaju i pregledavaju fotografije i videa na jednom mjestu.",
    auroraQuote: "Svaka uspomena zaslužuje dom. Pobrinut ću se da bude lijepa, organizirana i zauvijek vaša.",
    auroraQuoteIntro: "Od Aurore · Tvoj Calisto vodič",
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
      { href: "#features", label: "Funktionen" },
      { href: "#plans", label: "Tarife" },
      { href: "#future", label: "Zukunft" },
      { href: "#waitlist", label: "Warteliste" },
    ],
    joinWaitlistShort: "Zur Warteliste",
    heroBadge: "Lerne Aurora kennen",
    heroIntro: "Hi, ich bin Aurora — ich stelle dir Calisto vor.",
    heroTitle: "Ein gemeinsames Album für deine Hochzeit oder dein Event – Gäste treten per Code bei, du behältst die Kontrolle.",
    heroDescription:
      "Calisto hilft deinen Gästen, Fotos und Videos an einem Ort hochzuladen und anzusehen. Ich helfe dir, Erinnerungen organisiert zu halten – mit einfachem Zugangscode, optionalem QR-Invite und Speichertarifen passend zur Eventgröße – einmalige Zahlung pro Event statt Abo.",
    heroPrimaryCta: "Zur Warteliste",
    heroSecondaryCta: "Tarife vergleichen",
    statBar: [
      { value: "50+", label: "Gäste im Free-Tarif" },
      { value: "100 GB", label: "max. verfügbarer Speicher" },
      { value: "3", label: "Schritte zur Galerie" },
    ],
    appPreviewEyebrow: "Sieh es in Aktion",
    appPreviewAriaSection: "App-Vorschau",
    appPreviewAriaThumbs: "Screenshot-Vorschau",
    appPreviewCaptions: ["Galerieansicht", "Eventdetails", "Upload-Ablauf"],
    appPreviewViewAriaTemplate: "{name} ansehen",
    appPreviewImageAltTemplate: "Calisto-App — {name}",
    featuresTitle: "Was du machen kannst",
    featuresDescription:
      "Für große Tage, an denen alle fotografieren – Calisto hält Uploads organisiert und leicht teilbar.",
    featuresAuroraBubble:
      "Alle Uploads landen in einer Galerie – ich helfe, alles ordentlich zu halten.",
    features: [
      {
        title: "Einzigartiger Zugangscode",
        description: "Jedes Event hat seinen eigenen Code (z. B. WEDDING2026). Gäste treten ohne kompliziertes Setup bei.",
      },
      {
        title: "Einladungslinks & QR",
        description: "Teile einen Link oder zeige einen QR-Code, damit Gäste dem Album schnell vom Handy beitreten.",
      },
      {
        title: "Gemeinsame Galerie",
        description: "Alle sehen dieselbe Sammlung in Echtzeit, sobald Fotos und Videos eintreffen – ideal für Feiern.",
      },
      {
        title: "Sinnvolle Rollen",
        description: "Gäste laden hoch und schauen an; Organisatoren erstellen Events, verwalten Zugriffe und exportieren Archive.",
      },
      {
        title: "Fotos & Videos je Tarif",
        description: "Starte mit Fotos im Free-Tarif; kostenpflichtige Tarife schalten Videos und höhere Limits frei.",
      },
      {
        title: "ZIP-Export (bezahlte Tarife)",
        description: "Organisatoren können das komplette Album als ZIP herunterladen – je nach Tarif und Zeitpunkt.",
      },
    ],
    howTitle: "So funktioniert es",
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
        rows: [
          { label: "Preis", value: "0€" },
          { label: "Speicher", value: "1 GB" },
          { label: "Fotos", value: "Ja" },
          { label: "Videos", value: "Nein" },
          { label: "Aufbewahrung", value: "1 Monat nach Eventdatum" },
          { label: "Gästelimit", value: "50" },
          { label: "ZIP-Export", value: "Nein" },
        ],
      },
      {
        id: "standard",
        name: "Standard",
        rows: [
          { label: "Preis", value: "15€" },
          { label: "Speicher", value: "5 GB" },
          { label: "Fotos", value: "Ja" },
          { label: "Videos", value: "Bis zu 20 Videos, max. 30 Sekunden" },
          { label: "Aufbewahrung", value: "3 Monate nach Eventdatum" },
          { label: "Gästelimit", value: "150" },
          { label: "ZIP-Export", value: "Nur Organisatoren, ab 24 h nach Eventdatum" },
        ],
      },
      {
        id: "premium",
        name: "Premium",
        rows: [
          { label: "Preis", value: "25€" },
          { label: "Speicher", value: "20 GB" },
          { label: "Fotos", value: "Ja" },
          { label: "Videos", value: "Bis zu 100 Videos, max. 60 Sekunden" },
          { label: "Aufbewahrung", value: "6 Monate nach Eventdatum" },
          { label: "Gästelimit", value: "350" },
          { label: "ZIP-Export", value: "Nur Organisatoren, ab 24 h nach Eventdatum" },
        ],
      },
      {
        id: "max",
        name: "Max",
        rows: [
          { label: "Preis", value: "50€" },
          { label: "Speicher", value: "100 GB" },
          { label: "Fotos", value: "Ja" },
          { label: "Videos", value: "Unbegrenzt, max. 180 Sekunden" },
          { label: "Aufbewahrung", value: "12 Monate nach Eventdatum" },
          { label: "Gästelimit", value: "800" },
          { label: "ZIP-Export", value: "Nur Organisatoren, ab 24 h nach Event + vollständiges Archiv" },
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
