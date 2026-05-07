import { getSupabaseServerClient } from "@/lib/supabase-server";
import { GuestEventPage } from "./_components/GuestEventPage";
import type { PlanId } from "@/lib/plan-limits";

type JoinEventPageProps = Readonly<{
  params: Promise<{
    accessCode: string;
  }>;
}>;

export default async function JoinEventPage({ params }: JoinEventPageProps) {
  const { accessCode } = await params;
  const normalizedAccessCode = accessCode.trim().toUpperCase();
  const db = getSupabaseServerClient();

  const { data: event } = await db
    .from("events")
    .select("id, title, plan, event_date, access_code")
    .eq("access_code", normalizedAccessCode)
    .maybeSingle();

  if (!event) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-black">Event not found</h1>
        <p className="mt-2 text-sm text-gray-600">The join code is invalid or no longer active.</p>
      </main>
    );
  }

  const plan = event.plan;
  if (plan !== "free" && plan !== "standard" && plan !== "plus" && plan !== "premium" && plan !== "max") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold text-black">Event not found</h1>
        <p className="mt-2 text-sm text-gray-600">The join code is invalid or no longer active.</p>
      </main>
    );
  }

  return (
    <GuestEventPage
      accessCode={normalizedAccessCode}
      eventId={event.id as string}
      eventTitle={(event.title as string) ?? "Event"}
      planId={plan as PlanId}
      eventDate={(event.event_date as string) ?? new Date().toISOString()}
    />
  );
}
