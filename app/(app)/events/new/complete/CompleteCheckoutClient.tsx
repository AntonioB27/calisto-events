"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { clearCreateEventDraftFromStorage } from "@/lib/create-event-draft";

export function CompleteCheckoutClient() {
  const ui = useAppUi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      if (!sessionId) {
        setError(ui.stripeComplete.missingSession);
        return;
      }

      const response = await fetch("/api/stripe/fulfill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        credentials: "same-origin",
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; eventId?: string } | null;

      if (cancelled) return;

      if (!response.ok) {
        setError(payload?.error ?? ui.stripeComplete.fulfillFailGeneric);
        if (response.status === 409 || response.status === 404 || response.status === 503) {
          setDetail(ui.stripeComplete.fulfillRetryHint);
        }
        return;
      }

      if (!payload?.eventId || typeof payload.eventId !== "string") {
        setError(ui.stripeComplete.noEventId);
        return;
      }

      clearCreateEventDraftFromStorage();
      router.replace(`/events/${payload.eventId}?tab=share`);
      router.refresh();
    }

    void finish();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router, ui.locale]);

  return (
    <AppCard pad="lg" className="mt-8">
      {!sessionId ? (
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-danger)" }}>{ui.stripeComplete.missingSession}</p>
      ) : error ? (
        <>
          <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "var(--app-danger)" }}>{error}</p>
          {detail ? (
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.5 }}>{detail}</p>
          ) : null}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <AppBtn type="button" variant="primary" onClick={() => router.refresh()}>
              {ui.stripeComplete.tryAgain}
            </AppBtn>
            <AppBtn as={Link} href="/dashboard" variant="outline">
              {ui.stripeComplete.goDashboard}
            </AppBtn>
          </div>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>{ui.stripeComplete.finalizing}</p>
      )}
    </AppCard>
  );
}
