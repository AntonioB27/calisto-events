"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = {
  eventTitle: string;
  accessCode: string;
  onSessionReady: () => void;
};

export function WelcomeModal({ eventTitle, accessCode, onSessionReady }: Props) {
  const router = useRouter();
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const returnTo = `/join/${accessCode}`;

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNicknameError("Nickname must be 2–30 characters.");
      return;
    }
    setNicknameError(null);
    setBusy(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) throw anonError;

      const { error: joinError } = await supabase.rpc("join_event_with_code", {
        p_code: accessCode.toUpperCase(),
      });
      if (joinError) throw joinError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: trimmed },
      });
      if (updateError) throw updateError;

      onSessionReady();
    } catch {
      setNicknameError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">You&apos;re invited</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{eventTitle}</h1>
        <p className="mt-2 text-sm text-zinc-300">Join to upload photos &amp; videos and browse the gallery.</p>

        {!showNicknameInput ? (
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => router.push(`/auth/register?returnTo=${encodeURIComponent(returnTo)}`)}
              className="w-full rounded-full bg-amber-300 px-6 py-3 font-semibold text-zinc-900 transition hover:bg-amber-200"
              type="button"
            >
              Create account
            </button>
            <button
              onClick={() => router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}
              className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              type="button"
            >
              Log in
            </button>
            <button
              onClick={() => setShowNicknameInput(true)}
              className="w-full rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:text-white"
              type="button"
            >
              Continue as guest
            </button>
          </div>
        ) : (
          <form onSubmit={handleGuestSubmit} className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-medium text-zinc-200" htmlFor="nickname">
              Your nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (nicknameError) setNicknameError(null);
              }}
              placeholder="e.g. Maria"
              maxLength={30}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-300"
              autoFocus
            />
            {nicknameError ? <p className="text-sm text-red-300">{nicknameError}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-amber-300 px-6 py-3 font-semibold text-zinc-900 transition hover:bg-amber-200 disabled:opacity-60"
            >
              {busy ? "Joining…" : "Enter as guest"}
            </button>
            <button
              type="button"
              onClick={() => setShowNicknameInput(false)}
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

