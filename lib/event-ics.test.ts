import { describe, expect, it } from "vitest";

import { eventIcs } from "./event-ics";

describe("eventIcs", () => {
  const now = new Date("2026-10-29T10:20:30.456Z");

  it("makes an all-day entry on the event day, ending the next day", () => {
    const ics = eventIcs({ uid: "K7M2PQ9A@calisto", title: "Ana & Marko", eventDate: "2026-11-14", url: "https://x.test/join/K7M2PQ9A", now })!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20261114\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20261115\r\n");
    expect(ics).toContain("DTSTAMP:20261029T102030Z\r\n");
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("reads timestamp dates and rolls over month ends", () => {
    const ics = eventIcs({ uid: "u", title: "t", eventDate: "2026-12-31T00:00:00.000Z", url: "u", now })!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20261231\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20270101\r\n");
  });

  it("escapes text so a title can't add calendar fields", () => {
    const ics = eventIcs({ uid: "u", title: "A, B; C\\D\nEND:VEVENT", eventDate: "2026-11-14", url: "u", now })!;
    expect(ics).toContain("SUMMARY:A\\, B\\; C\\\\D\\nEND:VEVENT\r\n");
    expect(ics.match(/^END:VEVENT\r$/gm)?.length).toBe(1);
  });

  it("returns null for an unreadable date", () => {
    expect(eventIcs({ uid: "u", title: "t", eventDate: "soon", url: "u", now })).toBeNull();
  });
});
