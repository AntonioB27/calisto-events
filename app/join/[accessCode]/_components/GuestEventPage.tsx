"use client";

import { startTransition, useEffect, useState } from "react";

import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { canGuestUpload, type PlanId } from "@/lib/plan-limits";

import { GuestLeaveEvent } from "./GuestLeaveEvent";
import { MediaGrid } from "./MediaGrid";
import { UploadZone } from "./UploadZone";
import { WelcomeModal } from "./WelcomeModal";

type GuestEventPageProps = Readonly<{
  accessCode: string;
  eventId: string;
  eventTitle: string;
  organizerUserId: string;
  planId: PlanId;
  eventDate: string;
}>;

function guestJoinErrorMessage(raw: string) {
  const m = raw.toLowerCase();
  if (m.includes("invalid") || m.includes("not found")) return "That access code isn’t valid for joining right now.";
  if (m.includes("already")) return "You’re already part of this event.";
  return raw.trim() || "Something went wrong while joining. Try refreshing the page.";
}

export function GuestEventPage({
  accessCode,
  eventId,
  eventTitle,
  organizerUserId,
  planId,
  eventDate,
}: GuestEventPageProps) {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [membershipReady, setMembershipReady] = useState(false);
  const [membershipRpcError, setMembershipRpcError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) {
      queueMicrotask(() => setHasSession(false));
      return;
    }
    void supabase.auth.getSession().then((res: unknown) => {
      const session = (res as { data?: { session?: unknown } } | null)?.data?.session ?? null;
      setHasSession(session !== null);
    });
  }, []);

  useEffect(() => {
    if (!hasSession) return;

    let cancelled = false;

    startTransition(() => {
      setMembershipReady(false);
      setMembershipRpcError(null);
    });

    async function ensureMembership() {
      const supabase = maybeCreateSupabaseBrowserClient();
      if (!supabase) {
        setMembershipReady(true);
        return;
      }
      const { error } = await supabase.rpc("join_event_with_code", {
        p_code: accessCode.toUpperCase(),
      });
      if (!cancelled) {
        if (error) {
          setMembershipRpcError(guestJoinErrorMessage(error.message ?? ""));
        } else {
          setMembershipRpcError(null);
        }
        setMembershipReady(true);
      }
    }

    void ensureMembership();
    return () => {
      cancelled = true;
    };
  }, [hasSession, accessCode]);

  useEffect(() => {
    if (!hasSession || !membershipReady) {
      queueMicrotask(() => setUserId(null));
      return;
    }
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.auth.getUser().then((res: { data: { user: { id: string } | null } | null }) => {
      setUserId(res.data?.user?.id ?? null);
    });
  }, [hasSession, membershipReady]);

  const canLeaveAsGuest =
    Boolean(membershipReady && hasSession && userId && organizerUserId && userId !== organizerUserId);

  const uploadsOpen =
    hasSession &&
    canGuestUpload({
      planId,
      eventDate,
      now: new Date().toISOString(),
    });

  if (hasSession === null) {
    return (
      <main className="join-shell mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>Loading…</p>
      </main>
    );
  }

  if (hasSession && !membershipReady) {
    return (
      <main className="join-shell mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6 py-12">
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>Joining event…</p>
      </main>
    );
  }

  return (
    <main className="join-shell min-h-screen px-4 pb-16 pt-10 sm:px-6">
      {!hasSession && (
        <WelcomeModal eventTitle={eventTitle} accessCode={accessCode} onSessionReady={() => setHasSession(true)} />
      )}

      <div className="mx-auto max-w-3xl">
        <h1 style={{ marginBottom: 4, fontSize: "1.5rem", fontWeight: 800, color: "var(--app-text)" }}>{eventTitle}</h1>
        <p style={{ marginBottom: 32, fontSize: 14, color: "var(--app-muted)" }}>Share your memories from this event.</p>

        {hasSession ? <GuestLeaveEvent eventId={eventId} canShow={canLeaveAsGuest} /> : null}

        {membershipRpcError ? (
          <div
            role="alert"
            style={{
              marginBottom: 24,
              borderRadius: 16,
              border: "1.5px solid color-mix(in srgb, var(--app-danger) 45%, transparent)",
              background: "color-mix(in srgb, var(--app-danger) 12%, transparent)",
              padding: "12px 16px",
              fontSize: 14,
              color: "var(--app-danger)",
            }}
          >
            {membershipRpcError}
          </div>
        ) : null}

        {!uploadsOpen && hasSession ? (
          <div
            style={{
              marginBottom: 32,
              borderRadius: 16,
              border: "1.5px solid color-mix(in srgb, var(--app-warn) 45%, transparent)",
              background: "color-mix(in srgb, var(--app-warn) 12%, transparent)",
              padding: "12px 16px",
              fontSize: 14,
              color: "var(--app-warn)",
            }}
          >
            Uploads are closed for this event (upload window ended). You can still browse the gallery.
          </div>
        ) : null}

        {hasSession ? (
          <>
            <section style={{ marginBottom: 40 }}>
              <h2
                style={{
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--app-muted)",
                }}
              >
                Upload
              </h2>
              <UploadZone eventId={eventId} disabled={!uploadsOpen} onUploaded={() => setRefreshKey((k) => k + 1)} />
            </section>

            <section>
              <h2
                style={{
                  marginBottom: 16,
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--app-muted)",
                }}
              >
                Gallery
              </h2>
              <MediaGrid eventId={eventId} refreshKey={refreshKey} />
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
