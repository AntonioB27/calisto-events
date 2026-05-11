"use client";

import { AppBtn } from "@/components/app-ui/AppBtn";

export type ConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

/** Modal confirm — replaces browser `confirm()` for clearer UX. z-index above app lightboxes. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(0,0,0,0.55)",
      }}
      onClick={busy ? undefined : onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 18,
          padding: 22,
          background: "var(--app-surface)",
          border: "1.5px solid var(--app-border)",
          boxShadow: "var(--app-shadow-lg)",
        }}
      >
        <h2 id="confirm-dialog-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--app-text)" }}>
          {title}
        </h2>
        <p id="confirm-dialog-desc" style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--app-muted)" }}>
          {message}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
          <AppBtn type="button" variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </AppBtn>
          <AppBtn
            type="button"
            variant={variant === "danger" ? "danger" : "gold"}
            size="sm"
            disabled={busy}
            loading={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AppBtn>
        </div>
      </div>
    </div>
  );
}
