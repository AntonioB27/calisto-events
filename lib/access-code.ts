const ACCESS_CODE_REGEX = /^[A-Z0-9]{6,20}$/;

export function normalizeAccessCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isAccessCodeValid(input: string): boolean {
  return ACCESS_CODE_REGEX.test(normalizeAccessCode(input));
}
