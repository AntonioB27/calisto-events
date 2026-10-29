/** iCalendar TEXT escaping (RFC 5545 §3.3.11). */
function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/**
 * One all-day calendar entry on the event day (event_date is a date, no time), as an .ics file.
 * Null when the date can't be read.
 * shortcut: lines are not folded at 75 octets; Apple, Google and Outlook accept long lines. Fold if a client rejects one.
 */
export function eventIcs(args: Readonly<{ uid: string; title: string; eventDate: string; url: string; now?: Date }>): string | null {
  const day = args.eventDate.slice(0, 10);
  const start = Date.parse(day + "T00:00:00Z");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(start)) return null;

  const ymd = (ms: number) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, "");
  const stamp = (args.now ?? new Date()).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Calisto//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${icsText(args.uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(start)}`,
    `DTEND;VALUE=DATE:${ymd(start + 86_400_000)}`,
    `SUMMARY:${icsText(args.title)}`,
    `URL:${args.url}`,
    `DESCRIPTION:${icsText(args.url)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
