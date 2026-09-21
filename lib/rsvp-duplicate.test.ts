import { describe, expect, it } from "vitest";

import { findPossibleDuplicate, type ExistingRsvp } from "./rsvp-duplicate";

describe("findPossibleDuplicate", () => {
  const existing: ExistingRsvp[] = [
    {
      id: "row-1",
      submitterName: "Maria Novak",
      contact: "maria@example.com",
      attendees: [
        { name: "Maria Novak", type: "adult" },
        { name: "Ivan Novak", type: "adult" },
      ],
    },
    {
      id: "row-2",
      submitterName: "John Smith",
      contact: null,
      attendees: [{ name: "John Smith", type: "adult" }],
    },
  ];

  it("matches by contact email regardless of case", () => {
    const match = findPossibleDuplicate({ submitterName: "M. Novak", contact: "MARIA@EXAMPLE.COM" }, existing);
    expect(match?.id).toBe("row-1");
  });

  it("matches phone numbers ignoring formatting differences", () => {
    const withPhone: ExistingRsvp[] = [{ id: "row-3", submitterName: "Ana", contact: "+1 (555) 123-4567", attendees: [] }];
    const match = findPossibleDuplicate({ submitterName: "Someone else", contact: "1-555-123-4567" }, withPhone);
    expect(match?.id).toBe("row-3");
  });

  it("falls back to name similarity when no contact match is found", () => {
    const match = findPossibleDuplicate({ submitterName: "Maria Novak", contact: undefined }, existing);
    expect(match?.id).toBe("row-1");
  });

  it("matches on overlapping attendee names, not just the submitter name", () => {
    const match = findPossibleDuplicate(
      { submitterName: "Someone New", attendees: [{ name: "Ivan Novak", type: "adult" }] },
      existing,
    );
    expect(match?.id).toBe("row-1");
  });

  it("returns null when nothing resembles an existing submission", () => {
    const match = findPossibleDuplicate({ submitterName: "Completely Different Person" }, existing);
    expect(match).toBeNull();
  });

  it("returns null for an empty existing list", () => {
    expect(findPossibleDuplicate({ submitterName: "Anyone" }, [])).toBeNull();
  });
});
