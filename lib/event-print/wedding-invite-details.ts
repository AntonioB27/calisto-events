export type WeddingInviteDetails = Readonly<{
  connectorSymbol: string;
  gatheringType: string;
  gatheringAddress: string;
  gatheringTime: string;
  partnerAGatheringAddress: string;
  partnerAGatheringTime: string;
  partnerBGatheringAddress: string;
  partnerBGatheringTime: string;
  churchAddress: string;
  churchTime: string;
  dinnerAddress: string;
  dinnerTime: string;
  quoteText: string;
  quoteAuthor: string;
}>;

export type WeddingInviteDetailsStrings = Readonly<{
  gatheringTitle: string;
  churchTitle: string;
  dinnerTitle: string;
}>;

/** Maps the stored connector_symbol value to the character to render between partner names. */
export function connectorChar(sym: string, fallback: string): string {
  if (sym === "heart") return "♥";
  if (sym === "infinity") return "∞";
  if (sym === "ampersand") return "&";
  return fallback;
}
