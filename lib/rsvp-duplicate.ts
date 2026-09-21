export type RsvpAttendee = Readonly<{ name: string; type: "adult" | "child" }>;

export type RsvpCandidate = Readonly<{
  submitterName: string;
  contact?: string | null;
  attendees?: readonly RsvpAttendee[];
}>;

export type ExistingRsvp = Readonly<{
  id: string;
  submitterName: string;
  contact?: string | null;
  attendees?: readonly RsvpAttendee[];
}>;

function normalizeContact(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  // Phone numbers: strip everything but digits so "+1 (555) 123-4567" matches "5551234567".
  const digitsOnly = trimmed.replace(/[^0-9]/g, "");
  if (digitsOnly.length >= 6 && /^[0-9+\-() ]+$/.test(trimmed)) {
    return digitsOnly;
  }
  return trimmed;
}

function candidateNames(candidate: RsvpCandidate | ExistingRsvp): string[] {
  const names = (candidate.attendees ?? []).map((a) => a.name);
  return names.length > 0 ? names : [candidate.submitterName];
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Token-overlap similarity (Jaccard on word sets), 0..1. */
function nameSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeName(a).split(" ").filter(Boolean));
  const tokensB = new Set(normalizeName(b).split(" ").filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersection++;
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const NAME_SIMILARITY_THRESHOLD = 0.5;

/**
 * Finds the most likely existing duplicate for a new RSVP submission.
 * Contact info match wins outright; otherwise falls back to name-set similarity
 * across the party's names (submitter name, or attendee names when confirmed).
 * Never merges automatically — callers should flag the result for organizer review.
 */
export function findPossibleDuplicate(
  candidate: RsvpCandidate,
  existing: readonly ExistingRsvp[],
): ExistingRsvp | null {
  const candidateContact = normalizeContact(candidate.contact);
  if (candidateContact) {
    const contactMatch = existing.find((row) => normalizeContact(row.contact) === candidateContact);
    if (contactMatch) return contactMatch;
  }

  const candidateNameList = candidateNames(candidate);
  let best: { row: ExistingRsvp; score: number } | null = null;
  for (const row of existing) {
    const rowNameList = candidateNames(row);
    for (const a of candidateNameList) {
      for (const b of rowNameList) {
        const score = nameSimilarity(a, b);
        if (score >= NAME_SIMILARITY_THRESHOLD && (!best || score > best.score)) {
          best = { row, score };
        }
      }
    }
  }

  return best?.row ?? null;
}
