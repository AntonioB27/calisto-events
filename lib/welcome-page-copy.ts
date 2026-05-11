import type { Locale } from "@/lib/i18n";

export type WelcomePageCopy = {
  eyebrow: string;
  tagline: string;
  createEvent: string;
  joinEvent: string;
  haveAccount: string;
  backHome: string;
};

const WELCOME_PAGE_COPY: Record<Locale, WelcomePageCopy> = {
  en: {
    eyebrow: "Welcome to",
    tagline: "Collect photos and videos from everyone at your event.",
    createEvent: "Create an event",
    joinEvent: "Join an event",
    haveAccount: "I already have an account",
    backHome: "← Back to home",
  },
  hr: {
    eyebrow: "Dobrodošli u",
    tagline: "Prikupljajte fotografije i videozapise od svih na vašem događaju.",
    createEvent: "Stvorite događaj",
    joinEvent: "Pridružite se događaju",
    haveAccount: "Već imam račun",
    backHome: "← Natrag na početnu",
  },
  de: {
    eyebrow: "Willkommen bei",
    tagline: "Sammeln Sie Fotos und Videos von allen auf Ihrer Veranstaltung.",
    createEvent: "Veranstaltung erstellen",
    joinEvent: "Veranstaltung beitreten",
    haveAccount: "Ich habe bereits ein Konto",
    backHome: "← Zurück zur Startseite",
  },
};

export function getWelcomePageCopy(locale: Locale): WelcomePageCopy {
  return WELCOME_PAGE_COPY[locale];
}
