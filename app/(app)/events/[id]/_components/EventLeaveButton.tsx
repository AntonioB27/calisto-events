"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { mapLeaveEventRpcError } from "@/lib/event-leave-errors";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

/** Co-organizer "leave event": the trigger looks like whatever the caller passes as children. */
export function EventLeaveButton({
  eventId,
  className,
  children,
}: Readonly<{ eventId: string; className?: string; children: React.ReactNode }>) {
  const ui = useAppUi();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = maybeCreateSupabaseBrowserClient();
      if (!supabase) throw new Error(ui.leave.genericError);
      const { error: rpcErr } = await supabase.rpc("leave_event", { p_event_id: eventId });
      if (rpcErr) throw new Error(mapLeaveEventRpcError(rpcErr.message ?? "", ui.leaveRpc));
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setOpen(false);
      setError(e instanceof Error ? e.message : ui.leave.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
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
      <button type="button" className={className} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        {children}
      </button>
      {error ? (
        <p role="alert" style={{ margin: "0 14px 12px", fontSize: 13, color: "var(--app-danger)" }}>
          {error}
        </p>
      ) : null}
    </>
  );
}
