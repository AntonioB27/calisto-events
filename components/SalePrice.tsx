import { formatEuroCents, saleEuroCents } from "@/lib/event-stripe-checkout";

/** List price struck through next to the Black Month price; plain price when no sale applies. */
export function SalePrice({ listEuroCents }: { listEuroCents: number }) {
  const now = saleEuroCents(listEuroCents);
  if (now === listEuroCents) return <>{formatEuroCents(listEuroCents)}</>;
  return (
    <>
      <s style={{ opacity: 0.55, fontSize: "0.65em", marginRight: "0.35em", fontWeight: 400 }}>
        {formatEuroCents(listEuroCents)}
      </s>
      {formatEuroCents(now)}
    </>
  );
}
