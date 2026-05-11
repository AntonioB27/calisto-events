"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { mapLeaveEventRpcError } from "@/lib/event-leave-errors";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

export function EventLeaveBanner({ eventId }: Readonly<{ eventId: string }>) {
  const ui = useAppUi();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = maybeCreateSupabaseBrowserClient();

  async function onConfirm() {
    if (!supabase) return;
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
    <section style={{ marginBottom: 20 }}>
      <ConfirmDialog
        open={open}
        title={ui.leave.title}
        message={ui.leave.organizerMessage}
        confirmLabel={ui.leave.confirm}
        cancelLabel={ui.leave.cancelStay}
        variant="danger"
        busy={busy}
        onConfirm={() => void onConfirm()}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
      />
      {error ? (
        <p
          role="alert"
          style={{
            marginBottom: 10,
            fontSize: 13,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            color: "var(--app-danger)",
          }}
        >
          {error}
        </p>
      ) : null}
      {!supabase ? null : (
        <AppBtn type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {ui.leave.ctaOrganizerTab}
        </AppBtn>
      )}
    </section>
  );
}
