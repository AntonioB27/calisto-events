import { Suspense } from "react";

import { CompleteCheckoutClient } from "./CompleteCheckoutClient";

export default function NewEventStripeCompletePage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 0 60px" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 36,
          color: "var(--app-text)",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        Payment complete
      </h1>
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--app-muted)" }}>Stripe Checkout</p>
      <Suspense
        fallback={
          <div style={{ marginTop: 24, fontSize: 14, color: "var(--app-muted)" }}>Loading…</div>
        }
      >
        <CompleteCheckoutClient />
      </Suspense>
    </div>
  );
}
