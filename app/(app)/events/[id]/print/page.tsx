import Link from "next/link";
import QRCode from "react-qr-code";

import { getWebJoinUrl } from "@/lib/join-link";
import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function EventPrintPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, access_code, organizer_id")
    .eq("id", id)
    .maybeSingle();

  const isOrganizer = Boolean(event && user && event.organizer_id === user.id);
  if (!event || !isOrganizer) {
    return (
      <main className="min-h-screen bg-[#1a0a2e] px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-extrabold">Event not found</h1>
          <p className="mt-2 text-sm text-zinc-400">You don&apos;t have access to this event.</p>
        </div>
      </main>
    );
  }

  const publicOrigin = await getPublicOrigin();
  const joinUrl = getWebJoinUrl(publicOrigin, event.access_code);

  return (
    <main className="min-h-screen bg-[#1a0a2e] px-4 py-10 text-white print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-4xl print:max-w-none">
        <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
          <Link href={`/events/${id}?tab=share`} className="text-sm font-medium text-amber-300 underline">
            ← Back to Share
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-900 hover:bg-amber-300"
          >
            Print
          </button>
        </div>

        {/* Printable poster */}
        <article className="mx-auto w-full max-w-[800px] rounded-3xl border border-white/10 bg-white/5 p-10 text-center print:max-w-none print:rounded-none print:border-none print:bg-white print:p-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300 print:text-zinc-600">
            Scan to upload photos & videos
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white print:text-zinc-900">
            {event.title}
          </h1>

          <div className="mx-auto mt-10 inline-flex rounded-2xl bg-white p-6 print:border print:border-zinc-200">
            <QRCode value={joinUrl} size={260} />
          </div>

          <p className="mt-8 text-sm text-zinc-300 print:text-zinc-700">
            Or go to <span className="font-mono">{publicOrigin.replace(/^https?:\/\//, "")}</span> and enter code:
          </p>
          <p className="mt-3 inline-flex rounded-full border border-white/15 bg-white/5 px-6 py-3 font-mono text-2xl font-extrabold tracking-widest text-white print:border-zinc-300 print:bg-white print:text-zinc-900">
            {event.access_code}
          </p>

          <p className="mt-10 break-all font-mono text-xs text-zinc-500 print:text-zinc-600">{joinUrl}</p>
        </article>
      </div>
    </main>
  );
}

