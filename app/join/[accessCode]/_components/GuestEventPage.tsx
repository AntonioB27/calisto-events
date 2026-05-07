"use client";

import { startTransition, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { canGuestUpload, type PlanId } from "@/lib/plan-limits";

import { WelcomeModal } from "./WelcomeModal";
import { MediaGrid } from "./MediaGrid";
import { UploadZone } from "./UploadZone";

type GuestEventPageProps = Readonly<{
  accessCode: string;
  eventId: string;
  eventTitle: string;
  planId: PlanId;
  eventDate: string;
}>;

export function GuestEventPage({ accessCode, eventId, eventTitle, planId, eventDate }: GuestEventPageProps) {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [membershipReady, setMembershipReady] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(session !== null);
    });
  }, []);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    startTransition(() => setMembershipReady(false));

    async function ensureMembership() {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.rpc("join_event_with_code", {
        p_code: accessCode.toUpperCase(),
      });
      if (!cancelled) {
        if (error) {
          console.error("[guest] join_event_with_code", error.message);
        }
        setMembershipReady(true);
      }
    }

    void ensureMembership();
    return () => {
      cancelled = true;
    };
  }, [hasSession, accessCode]);

  const uploadsOpen =
    hasSession &&
    canGuestUpload({
      planId,
      eventDate,
      now: new Date().toISOString(),
    });

  if (hasSession === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  if (hasSession && !membershipReady) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p className="text-sm text-zinc-500">Joining event…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1a0a2e] px-4 pb-16 pt-10 sm:px-6">
      {!hasSession && (
        <WelcomeModal
          eventTitle={eventTitle}
          accessCode={accessCode}
          onSessionReady={() => setHasSession(true)}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <h1 className="mb-1 text-2xl font-extrabold text-white">{eventTitle}</h1>
        <p className="mb-8 text-sm text-zinc-400">Share your memories from this event.</p>

        {!uploadsOpen && hasSession && (
          <div className="mb-8 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Uploads are closed for this event (upload window ended). You can still browse the gallery.
          </div>
        )}

        {hasSession && (
          <>
            <section className="mb-10">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">Upload</h2>
              <UploadZone
                eventId={eventId}
                disabled={!uploadsOpen}
                onUploaded={() => setRefreshKey((k) => k + 1)}
              />
            </section>

            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-400">Gallery</h2>
              <MediaGrid eventId={eventId} refreshKey={refreshKey} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
