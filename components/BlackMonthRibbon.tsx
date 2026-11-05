import type { BlackMonthCopy } from "@/lib/black-month-copy";
import { blackMonthDaysLeft } from "@/lib/event-stripe-checkout";

/** Gold bar above the header with a real countdown to the sale end. Server-rendered per request. */
export function BlackMonthRibbon({ sale }: { sale: BlackMonthCopy }) {
  const daysLeft = blackMonthDaysLeft();
  const countdown = daysLeft <= 1 ? sale.lastDay : sale.daysLeft.replace("{n}", String(daysLeft));
  return (
    <a
      href="#plans"
      style={{
        display: "block",
        position: "relative",
        zIndex: 51,
        padding: "9px 16px",
        textAlign: "center",
        background: "linear-gradient(135deg, #F5C76B 0%, #F0B34B 45%, #C9912E 100%)",
        color: "#1b1208",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        textDecoration: "none",
      }}
    >
      {sale.ribbon} · <strong style={{ fontWeight: 700 }}>{countdown}</strong>
    </a>
  );
}
