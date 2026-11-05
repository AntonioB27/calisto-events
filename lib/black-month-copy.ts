import type { Locale } from "@/lib/i18n";

/** Landing copy for the Black Month sale (see `isBlackMonthActive`). Delete with the sale. */
export type BlackMonthCopy = Readonly<{
  ribbon: string;
  /** `{n}` = whole days left, always 2 or more. */
  daysLeft: string;
  lastDay: string;
  badge: string;
  titleLead: string;
  titleAccent: string;
  description: string;
  endsNote: string;
  /** `{max}` = Max plan sale price. */
  aurora: string;
  plansTitle: string;
  plansNote: string;
}>;

export const BLACK_MONTH_COPY: Record<Locale, BlackMonthCopy> = {
  en: {
    ribbon: "Black Month · 50% off every plan",
    daysLeft: "{n} days left",
    lastDay: "Last day",
    badge: "Black Month 2026",
    titleLead: "Every plan,",
    titleAccent: "half price.",
    description:
      "Collect every photo and video your guests take, for half the price. Book now for an event on any date, even next summer.",
    endsNote: "Sale ends November 30 at midnight.",
    aurora: "Psst. Max is {max} right now. Unlimited guests and a whole year to keep every memory.",
    plansTitle: "One price per event. This month, half.",
    plansNote: "Sale prices until November 30. One-time payment, and your event can be on any date.",
  },
  hr: {
    ribbon: "Black Month · 50% popusta na sve pakete",
    daysLeft: "Preostalo dana: {n}",
    lastDay: "Zadnji dan",
    badge: "Black Month 2026",
    titleLead: "Svi paketi,",
    titleAccent: "upola cijene.",
    description:
      "Skupite svaku fotografiju i video koje snime vaši gosti, za pola cijene. Rezervirajte sada za događaj na bilo koji datum, čak i sljedeće ljeto.",
    endsNote: "Akcija završava 30. studenoga u ponoć.",
    aurora: "Psst. Max je sada {max}. Neograničen broj gostiju i cijela godina za čuvanje uspomena.",
    plansTitle: "Jedna cijena po događaju. Ovaj mjesec, upola.",
    plansNote: "Akcijske cijene vrijede do 30. studenoga. Jednokratno plaćanje, a događaj može biti na bilo koji datum.",
  },
  de: {
    ribbon: "Black Month · 50 % auf alle Tarife",
    daysLeft: "Noch {n} Tage",
    lastDay: "Letzter Tag",
    badge: "Black Month 2026",
    titleLead: "Jeder Tarif,",
    titleAccent: "zum halben Preis.",
    description:
      "Sammle jedes Foto und Video deiner Gäste, zum halben Preis. Buche jetzt für ein Event an jedem beliebigen Datum, auch für den nächsten Sommer.",
    endsNote: "Das Angebot endet am 30. November um Mitternacht.",
    aurora: "Psst. Max kostet gerade {max}. Unbegrenzt viele Gäste und ein ganzes Jahr für all eure Erinnerungen.",
    plansTitle: "Ein Preis pro Event. Diesen Monat die Hälfte.",
    plansNote: "Aktionspreise bis 30. November. Einmalige Zahlung, und dein Event kann an jedem Datum stattfinden.",
  },
};
