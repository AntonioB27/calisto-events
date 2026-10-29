import { Suspense } from "react";

import { TabHeader } from "@/components/app-ui/TabHeader";
import { CompleteCheckoutClient } from "./CompleteCheckoutClient";

export default function NewEventStripeCompletePage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px 60px" }}>
      <TabHeader title="Payment complete" pose="happy" poseSize={104}>
        Stripe Checkout
      </TabHeader>
      <Suspense
        fallback={
          <div className="tab-card" style={{ marginTop: 14, fontSize: 15, color: "var(--app-muted)" }}>Loading…</div>
        }
      >
        <CompleteCheckoutClient />
      </Suspense>
    </div>
  );
}
