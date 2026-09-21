import { randomBytes } from "crypto";

// Excludes 0/O/1/I to avoid transcription mistakes when read aloud or handwritten.
const RSVP_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RSVP_CODE_LENGTH = 8;

export function generateRsvpCode(): string {
  const bytes = randomBytes(RSVP_CODE_LENGTH);
  let code = "";
  for (let i = 0; i < RSVP_CODE_LENGTH; i++) {
    code += RSVP_CODE_ALPHABET[bytes[i] % RSVP_CODE_ALPHABET.length];
  }
  return code;
}

export function normalizeRsvpCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isRsvpCodeValid(input: string): boolean {
  const normalized = normalizeRsvpCode(input);
  if (normalized.length !== RSVP_CODE_LENGTH) return false;
  return [...normalized].every((ch) => RSVP_CODE_ALPHABET.includes(ch));
}
