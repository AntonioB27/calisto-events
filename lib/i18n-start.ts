import type { Locale } from "@/lib/i18n";

type PlanKey = "free" | "standard" | "plus" | "premium" | "max";
type Review = { quote: string; name: string; event: string };

export type StartPageCopy = {
  loginLink: string;
  reviewBadge: string;
  heroLine1: string;
  heroLine2: string;
  heroSub: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formDateLabel: string;
  formEmojiLabel: string;
  formEmojiOpen: string;
  formEmojiClose: string;
  formCta: string;
  formReassurance: string;
  howLabel: string;
  howSteps: readonly [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
  reviewsLabel: string;
  reviews: readonly [Review, Review, Review];
  features: readonly [string, string, string, string];
  pricingLabel: string;
  pricingTitle: string;
  popularBadge: string;
  perEvent: string;
  guestLimits: Record<PlanKey, string>;
  choosePlusCta: string;
  choosePlanCta: string;
  planDescriptions: Record<PlanKey, string>;
  fairUse: string;
  stickyTitle: string;
  stickySub: string;
  stickyCta: string;
  demoCta: string;
};

const copy: Record<Locale, StartPageCopy> = {
  en: {
    loginLink: "Sign in",
    reviewBadge: "4.9",
    heroLine1: "Guests scan.",
    heroLine2: "You collect memories.",
    heroSub:
      "One QR code captures all photos and videos from your celebration, live, without an app, in full quality.",
    formNameLabel: "Event name",
    formNamePlaceholder: "e.g. Tony and Mae's Wedding",
    formDateLabel: "Event date",
    formEmojiLabel: "Emoji",
    formEmojiOpen: "Choose emoji",
    formEmojiClose: "Close picker",
    formCta: "Create your event →",
    formReassurance: "No credit card · ready instantly",
    howLabel: "How it works",
    howSteps: [
      { title: "Create your event", desc: "Name, date, and you are done." },
      { title: "Guests scan the QR", desc: "No app, no registration." },
      { title: "Memories arrive live", desc: "All in one place, in full quality." },
    ],
    reviewsLabel: "What others say",
    reviews: [
      {
        quote: "Our guests couldn't stop uploading photos. By the end of the night we had over 400 pictures, all in one place.",
        name: "Maja K.",
        event: "Wedding",
      },
      {
        quote: "Setup took 2 minutes. I shared the QR code and everyone figured it out on their own.",
        name: "Tomislav R.",
        event: "Birthday",
      },
      {
        quote: "Best thing I did for the reunion. No more 'send me those photos' messages in the group chat.",
        name: "Ana S.",
        event: "Class reunion",
      },
    ],
    features: [
      "No app, guests just scan",
      "Photos and videos in full quality",
      "Download the whole album in one click",
      "Private and only for your guests",
    ],
    pricingLabel: "Plans · per event",
    pricingTitle: "Choose your celebration size",
    popularBadge: "Most popular",
    perEvent: "/ EVENT",
    guestLimits: {
      free: "up to 30 guests",
      standard: "up to 80 guests",
      plus: "up to 200 guests",
      premium: "up to 500 guests",
      max: "unlimited",
    },
    choosePlusCta: "Choose Plus →",
    choosePlanCta: "Get started →",
    planDescriptions: {
      free: "For small birthdays and family gatherings",
      standard: "For birthdays and small weddings",
      plus: "For medium celebrations and longer guest lists",
      premium: "For large weddings and formal events",
      max: "For festivals, multi-day events and unlimited reach",
    },
    fairUse:
      "Fair-use policy applies: there is a reasonable maximum file size limit for video files to prevent abuse.",
    stickyTitle: "Ready in 30 seconds",
    stickySub: "Free plan · no card",
    stickyCta: "Create →",
    demoCta: "See a live demo first",
  },

  hr: {
    loginLink: "Prijava",
    reviewBadge: "4,9",
    heroLine1: "Gosti skeniraju.",
    heroLine2: "Vi skupljate uspomene.",
    heroSub:
      "Jedan QR kod prikuplja sve fotografije i videe s vaše proslave, uživo, bez aplikacije, u punoj kvaliteti.",
    formNameLabel: "Naziv događaja",
    formNamePlaceholder: "npr. Antonio i Matea",
    formDateLabel: "Datum događaja",
    formEmojiLabel: "Emoji",
    formEmojiOpen: "Odaberi emoji",
    formEmojiClose: "Zatvori",
    formCta: "Stvori događaj →",
    formReassurance: "Bez kreditne kartice · spremno odmah",
    howLabel: "Kako radi",
    howSteps: [
      { title: "Stvorite događaj", desc: "Naziv, datum, i gotovi ste." },
      { title: "Gosti skeniraju QR", desc: "Bez aplikacije, bez registracije." },
      { title: "Uspomene stižu uživo", desc: "Sve na jednom mjestu, u punoj kvaliteti." },
    ],
    reviewsLabel: "Sto drugi kazu",
    reviews: [
      {
        quote: "Gosti nisu mogli prestati uploadati fotke. Do kraja veceri imali smo 400+ slika, sve na jednom mjestu.",
        name: "Maja K.",
        event: "Vjencanje",
      },
      {
        quote: "Postavljanje je trajalo 2 minute. Podijelila sam QR kod i svi su sami shvatili.",
        name: "Tomislav R.",
        event: "Rodjendan",
      },
      {
        quote: "Najbolja stvar koju sam napravila za maturalac. Nema vise poruka 'posalji mi te slike' u grupi.",
        name: "Ana S.",
        event: "Maturalno putovanje",
      },
    ],
    features: [
      "Bez aplikacije, gosti samo skeniraju",
      "Fotografije i videi u punoj kvaliteti",
      "Preuzmite cijeli album jednim klikom",
      "Privatno i samo za vaše goste",
    ],
    pricingLabel: "Planovi · po događaju",
    pricingTitle: "Odaberite veličinu proslave",
    popularBadge: "Najpopularnije",
    perEvent: "/ DOGAĐAJ",
    guestLimits: {
      free: "do 30 gostiju",
      standard: "do 80 gostiju",
      plus: "do 200 gostiju",
      premium: "do 500 gostiju",
      max: "neograničeno",
    },
    choosePlusCta: "Odaberi Plus →",
    choosePlanCta: "Odaberi plan →",
    planDescriptions: {
      free: "Za male rođendane i obiteljska okupljanja",
      standard: "Za rođendane i manja vjenčanja",
      plus: "Za srednje proslave i duže liste gostiju",
      premium: "Za velika vjenčanja i svečane događaje",
      max: "Za festivale, višednevne evente i neograničen obuhvat",
    },
    fairUse:
      "Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe.",
    stickyTitle: "Spremno za 30 sekundi",
    stickySub: "Free plan · bez kartice",
    stickyCta: "Stvori →",
    demoCta: "Prvo pogledaj demo",
  },

  de: {
    loginLink: "Anmelden",
    reviewBadge: "4,9",
    heroLine1: "Gäste scannen.",
    heroLine2: "Du sammelst Erinnerungen.",
    heroSub:
      "Ein QR-Code erfasst alle Fotos und Videos deiner Feier, live, ohne App, in voller Qualität.",
    formNameLabel: "Event-Name",
    formNamePlaceholder: "z.B. Hochzeit Anna und Max",
    formDateLabel: "Event-Datum",
    formEmojiLabel: "Emoji",
    formEmojiOpen: "Emoji wählen",
    formEmojiClose: "Schließen",
    formCta: "Event erstellen →",
    formReassurance: "Keine Kreditkarte · sofort bereit",
    howLabel: "So funktioniert's",
    howSteps: [
      { title: "Event erstellen", desc: "Name, Datum, und fertig." },
      { title: "Gäste scannen den QR", desc: "Keine App, keine Registrierung." },
      { title: "Erinnerungen kommen live", desc: "Alles an einem Ort, in voller Qualität." },
    ],
    reviewsLabel: "Was andere sagen",
    reviews: [
      {
        quote: "Unsere Gaste horten nicht auf, Fotos hochzuladen. Am Ende hatten wir 400+ Bilder an einem Ort.",
        name: "Maja K.",
        event: "Hochzeit",
      },
      {
        quote: "Einrichten dauerte 2 Minuten. Ich habe den QR-Code geteilt und alle haben es selbst herausgefunden.",
        name: "Tomislav R.",
        event: "Geburtstag",
      },
      {
        quote: "Das Beste, was ich fur das Treffen gemacht habe. Kein 'Schick mir die Fotos' mehr in der Gruppe.",
        name: "Ana S.",
        event: "Klassentreffen",
      },
    ],
    features: [
      "Keine App, Gäste scannen einfach",
      "Fotos und Videos in voller Qualität",
      "Gesamtes Album mit einem Klick herunterladen",
      "Privat und nur für deine Gäste",
    ],
    pricingLabel: "Tarife · pro Event",
    pricingTitle: "Wähle deine Eventgröße",
    popularBadge: "Beliebteste",
    perEvent: "/ EVENT",
    guestLimits: {
      free: "bis 30 Gäste",
      standard: "bis 80 Gäste",
      plus: "bis 200 Gäste",
      premium: "bis 500 Gäste",
      max: "unbegrenzt",
    },
    choosePlusCta: "Plus wählen →",
    choosePlanCta: "Plan wählen →",
    planDescriptions: {
      free: "Für kleine Geburtstage und Familientreffen",
      standard: "Für Geburtstage und kleine Hochzeiten",
      plus: "Für mittlere Feiern und längere Gästelisten",
      premium: "Für große Hochzeiten und festliche Events",
      max: "Für Festivals, mehrtägige Events und unbegrenzte Reichweite",
    },
    fairUse:
      "Es gilt eine Fair-Use-Richtlinie: Es gibt eine angemessene maximale Dateigröße für Videos, um Missbrauch zu verhindern.",
    stickyTitle: "In 30 Sekunden bereit",
    stickySub: "Free-Plan · ohne Karte",
    stickyCta: "Erstellen →",
    demoCta: "Erst die Demo ansehen",
  },
};

export function getStartPageCopy(locale: Locale): StartPageCopy {
  return copy[locale];
}
