import type { Locale } from "@/lib/i18n";

export type WelcomePageCopy = {
  eyebrow: string;
  tagline: string;
  register: string;
  logIn: string;
  joinWithCode: string;
  backHome: string;
  onboardingHeading: string;
  onboardingCreateTitle: string;
  onboardingCreateSub: string;
  onboardingJoinTitle: string;
  onboardingJoinSub: string;
  onboardingDashboardTitle: string;
  onboardingDashboardSub: string;
};

const WELCOME_PAGE_COPY: Record<Locale, WelcomePageCopy> = {
  en: {
    eyebrow: "Welcome to",
    tagline: "Collect photos and videos from everyone at your event.",
    register: "Create an account",
    logIn: "Log in",
    joinWithCode: "Join with a code",
    backHome: "← Back to home",
    onboardingHeading: "What would you like to do?",
    onboardingCreateTitle: "Create an event",
    onboardingCreateSub: "Set up a new event and invite your guests.",
    onboardingJoinTitle: "Join an event",
    onboardingJoinSub: "Enter an access code from your organizer.",
    onboardingDashboardTitle: "Go to dashboard",
    onboardingDashboardSub: "View and manage your existing events.",
  },
  hr: {
    eyebrow: "Dobrodošli u",
    tagline: "Prikupljajte fotografije i videozapise od svih na vašem događaju.",
    register: "Stvori račun",
    logIn: "Prijavi se",
    joinWithCode: "Pridruži se s kodom",
    backHome: "← Natrag na početnu",
    onboardingHeading: "Što biste željeli napraviti?",
    onboardingCreateTitle: "Stvori događaj",
    onboardingCreateSub: "Postavi novi događaj i pozovi goste.",
    onboardingJoinTitle: "Pridruži se događaju",
    onboardingJoinSub: "Unesite pristupni kod od svog organizatora.",
    onboardingDashboardTitle: "Idi na nadzornu ploču",
    onboardingDashboardSub: "Pregledaj i upravljaj svojim događajima.",
  },
  de: {
    eyebrow: "Willkommen bei",
    tagline: "Sammeln Sie Fotos und Videos von allen auf Ihrer Veranstaltung.",
    register: "Konto erstellen",
    logIn: "Anmelden",
    joinWithCode: "Mit Code beitreten",
    backHome: "← Zurück zur Startseite",
    onboardingHeading: "Was möchtest du tun?",
    onboardingCreateTitle: "Veranstaltung erstellen",
    onboardingCreateSub: "Richte eine neue Veranstaltung ein und lade deine Gäste ein.",
    onboardingJoinTitle: "Veranstaltung beitreten",
    onboardingJoinSub: "Gib den Zugangscode von deinem Organisator ein.",
    onboardingDashboardTitle: "Zum Dashboard",
    onboardingDashboardSub: "Zeige und verwalte deine bestehenden Veranstaltungen.",
  },
};

export function getWelcomePageCopy(locale: Locale): WelcomePageCopy {
  return WELCOME_PAGE_COPY[locale];
}
