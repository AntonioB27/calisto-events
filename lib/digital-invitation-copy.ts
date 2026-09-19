import type { Locale } from "@/lib/i18n";

const en = {
  back: "Invitation editor", title: "Digital invitations", description: "Send the exact invitation you designed, then collect each household's response.",
  publish: "Publish invitation", republish: "Update guest version", published: "Published", publishHint: "Publishing creates the version guests see. Updating it is deliberate and changes every active invitation link.",
  householdTitle: "Recipient links", householdHint: "Create one personal link for each household. Guests do not need a Calisto account.",
  householdLabel: "Household name", householdPlaceholder: "Antonio & family", partySize: "Maximum attendees", create: "Create link", copy: "Copy link", copied: "Copied", noHouseholds: "No recipient links yet.",
  pending: "Pending", attending: "Coming", declined: "Declined", attendees: "attendees", responseSummary: "responses", confirmed: "confirmed people", saveFailed: "Could not save. Please try again.",
  guestEyebrow: "You are invited", guestTitle: "Will you join us?", guestGreeting: "For {household}", guestIntro: "Tell the hosts who will be attending from your household.",
  coming: "We are coming", notComing: "We cannot come", whoIsComing: "Who is coming?", attendeePlaceholder: "Full name", addPerson: "Add another person", submit: "Confirm RSVP", update: "Update RSVP",
  responseSaved: "Your response has been saved.", responseClosed: "RSVPs are now closed.", responseFailed: "We could not save your response. Please try again.", requiredName: "Add at least one attendee name.",
};
const hr: typeof en = {
  back: "Uređivanje pozivnice", title: "Digitalne pozivnice", description: "Pošaljite istu pozivnicu koju ste dizajnirali i prikupite odgovor svakog kućanstva.",
  publish: "Objavi pozivnicu", republish: "Ažuriraj verziju za goste", published: "Objavljeno", publishHint: "Objavljivanjem nastaje verzija koju gosti vide. Ažuriranje je namjerno i mijenja svaku aktivnu poveznicu.",
  householdTitle: "Poveznice za kućanstva", householdHint: "Stvorite osobnu poveznicu za svako kućanstvo. Gostima ne treba Calisto račun.",
  householdLabel: "Naziv kućanstva", householdPlaceholder: "Antonio i obitelj", partySize: "Najviše osoba", create: "Stvori poveznicu", copy: "Kopiraj poveznicu", copied: "Kopirano", noHouseholds: "Još nema poveznica za primatelje.",
  pending: "Čeka odgovor", attending: "Dolaze", declined: "Ne dolaze", attendees: "osoba", responseSummary: "odgovora", confirmed: "potvrđenih osoba", saveFailed: "Spremanje nije uspjelo. Pokušajte ponovno.",
  guestEyebrow: "Pozvani ste", guestTitle: "Hoćete li nam se pridružiti?", guestGreeting: "Za {household}", guestIntro: "Recite domaćinima tko dolazi iz vašeg kućanstva.",
  coming: "Dolazimo", notComing: "Ne možemo doći", whoIsComing: "Tko dolazi?", attendeePlaceholder: "Ime i prezime", addPerson: "Dodaj još jednu osobu", submit: "Potvrdi odgovor", update: "Ažuriraj odgovor",
  responseSaved: "Vaš odgovor je spremljen.", responseClosed: "Odgovori su zatvoreni.", responseFailed: "Odgovor se nije mogao spremiti. Pokušajte ponovno.", requiredName: "Dodajte barem jedno ime osobe koja dolazi.",
};
const de: typeof en = {
  back: "Einladung bearbeiten", title: "Digitale Einladungen", description: "Senden Sie die gestaltete Einladung und sammeln Sie die Antwort jedes Haushalts.",
  publish: "Einladung veröffentlichen", republish: "Gästeversion aktualisieren", published: "Veröffentlicht", publishHint: "Die Veröffentlichung erstellt die Version für Gäste. Eine Aktualisierung ändert bewusst jeden aktiven Einladungslink.",
  householdTitle: "Empfängerlinks", householdHint: "Erstellen Sie für jeden Haushalt einen persönlichen Link. Gäste brauchen kein Calisto-Konto.",
  householdLabel: "Name des Haushalts", householdPlaceholder: "Antonio und Familie", partySize: "Maximale Gäste", create: "Link erstellen", copy: "Link kopieren", copied: "Kopiert", noHouseholds: "Noch keine Empfängerlinks.",
  pending: "Ausstehend", attending: "Kommen", declined: "Abgesagt", attendees: "Gäste", responseSummary: "Antworten", confirmed: "bestätigte Personen", saveFailed: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
  guestEyebrow: "Sie sind eingeladen", guestTitle: "Kommen Sie zu uns?", guestGreeting: "Für {household}", guestIntro: "Teilen Sie den Gastgebern mit, wer aus Ihrem Haushalt teilnehmen wird.",
  coming: "Wir kommen", notComing: "Wir können nicht kommen", whoIsComing: "Wer kommt?", attendeePlaceholder: "Vollständiger Name", addPerson: "Person hinzufügen", submit: "Antwort bestätigen", update: "Antwort ändern",
  responseSaved: "Ihre Antwort wurde gespeichert.", responseClosed: "Antworten sind geschlossen.", responseFailed: "Ihre Antwort konnte nicht gespeichert werden. Bitte erneut versuchen.", requiredName: "Fügen Sie mindestens einen Namen hinzu.",
};

export function digitalInvitationCopy(locale: Locale) {
  return locale === "hr" ? hr : locale === "de" ? de : en;
}
