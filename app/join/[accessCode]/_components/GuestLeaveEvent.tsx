"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { mapLeaveEventRpcError } from "@/lib/event-leave-errors";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

export function GuestLeaveEvent({
  eventId,
  canShow,
}: Readonly<{ eventId: string; canShow: boolean }>) {
  const ui = useAppUi();
  const router = useRouter();
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canShow || !supabase) return null;

  async function confirmLeave() {
    setBusy(true);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("leave_event", { p_event_id: eventId });
      if (rpcErr) throw new Error(mapLeaveEventRpcError(rpcErr.message ?? "", ui.leaveRpc));
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.leave.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <ConfirmDialog
        open={open}
        title={ui.leave.title}
        message={ui.leave.guestMessage}
        confirmLabel={ui.leave.confirm}
        cancelLabel={ui.leave.cancelStay}
        variant="danger"
        busy={busy}
        onConfirm={() => void confirmLeave()}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
      />
      {error ? (
        <div
          role="alert"
          style={{
            marginBottom: 10,
            padding: "10px 14px",
            borderRadius: 14,
            fontSize: 14,
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 45%, transparent)",
            background: "color-mix(in srgb, var(--app-danger) 12%, transparent)",
            color: "var(--app-danger)",
          }}
        >
          {error}
        </div>
      ) : null}
      <AppBtn type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        {ui.leave.guestCtaSame}
      </AppBtn>
    </section>
  );
}
