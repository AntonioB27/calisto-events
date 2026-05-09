/**
 * Leading segment before the first ASCII space counts as our stored icon only when it clearly
 * isn't a word — e.g. `"Kyle & Laura"` must stay one name, not icon `Kyle` + name `& Laura`.
 */
function isStoredLeadingIconToken(head: string): boolean {
  const h = head.trim();
  if (!h) return false;
  if (/[a-zA-Z0-9]/.test(h)) return false;
  return /\p{Extended_Pictographic}/u.test(h);
}

/** Parse how we store titles: `"🎉 Name"` when an icon exists, otherwise plain `"Name"` (can include spaces). */
export function splitEventTitleStored(title: string): { emoji: string; name: string } {
  const t = title.trim();
  if (!t) return { emoji: "", name: "Event" };
  const i = t.indexOf(" ");
  if (i === -1) return { emoji: "", name: t };
  const head = t.slice(0, i).trim();
  const tail = t.slice(i + 1).trim();
  if (!tail || !isStoredLeadingIconToken(head)) {
    return { emoji: "", name: t };
  }
  return { emoji: head, name: tail };
}

/** Matches create-event inserts: emoji + space + name when an emoji is chosen. */
export function composeEventTitle(emoji: string, name: string): string {
  const n = name.trim() || "Event";
  const e = emoji.trim();
  return e ? `${e} ${n}` : n;
}

/** Header display when DB has no leading emoji fragment. */
export function displayNavEmoji(storedEmoji: string): string {
  return storedEmoji.trim() || "📅";
}
