"use client";

import type { PlanId } from "@/lib/plan-limits";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Step3PaymentProps = {
  name: string;
  date: string;
  planId: PlanId;
  validationError: "NAME_REQUIRED" | null;
};

export function Step3Payment({ name, date, planId, validationError }: Step3PaymentProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (validationError) {
    return (
      <section className="mt-8 rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{validationError}</p>
        <Link className="mt-4 inline-block text-sm font-medium underline" href="/events/new?step=1">
          Go back to details
        </Link>
      </section>
    );
  }

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in.");

      const accessCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({
          title: name.trim(),
          event_date: new Date(date).toISOString(),
          organizer_id: user.id,
          plan: planId,
          access_code: accessCode,
        })
        .select("id")
        .single();

      if (insertError || !data?.id) {
        throw new Error(insertError?.message ?? "Could not create event.");
      }

      router.push(`/events/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create event.");
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 space-y-4 rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-black">Payment</h2>
      <p className="text-sm text-gray-700">
        Event <strong>{name}</strong> on <strong>{date}</strong> with the <strong>{planId}</strong>{" "}
        plan.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        disabled={busy}
        onClick={onConfirm}
      >
        {busy ? "Creating…" : "Confirm and create event"}
      </button>
    </section>
  );
}
