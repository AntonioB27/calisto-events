"use client";

import type { Html5Qrcode } from "html5-qrcode";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { useCallback, useEffect, useRef, useState } from "react";

export type JoinQrScannerStrings = {
  title: string;
  hint: string;
  startCamera: string;
  stopCamera: string;
  back: string;
  unsupported: string;
  permissionDenied: string;
  noCamera: string;
};

type Props = {
  strings: JoinQrScannerStrings;
  disabled?: boolean;
  /** Return true when the scan was accepted (preview succeeded). False re-enables scanning. */
  onRawScan: (raw: string) => Promise<boolean>;
  onBack: () => void;
};

export function JoinQrScanner({ strings, disabled, onRawScan, onBack }: Props) {
  const [phase, setPhase] = useState<"idle" | "starting" | "scanning" | "cam_error">("idle");
  const [camError, setCamError] = useState<string | null>(null);
  const html5Ref = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);

  const stopScanner = useCallback(async () => {
    const html5 = html5Ref.current;
    html5Ref.current = null;
    if (!html5) return;
    try {
      if (html5.isScanning) {
        await html5.stop();
      }
    } catch {
      /* already stopped */
    }
    try {
      await html5.clear();
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    return () => {
      void stopScanner();
    };
  }, [stopScanner]);

  async function start() {
    setCamError(null);
    setPhase("starting");
    handledRef.current = false;

    const el = document.getElementById("join-qr-reader");
    if (!el) {
      setCamError(strings.unsupported);
      setPhase("cam_error");
      return;
    }

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const html5 = new Html5Qrcode("join-qr-reader", false);
      html5Ref.current = html5;

      await html5.start(
        { facingMode: "environment" },
        {
          fps: 8,
          qrbox: { width: 260, height: 260 },
        },
        async (decodedText) => {
          if (handledRef.current || disabled) return;
          handledRef.current = true;
          await stopScanner();
          const ok = await onRawScan(decodedText);
          if (!ok) {
            handledRef.current = false;
            setPhase("idle");
          }
        },
        () => {},
      );
      setPhase("scanning");
    } catch (e) {
      html5Ref.current = null;
      const err = e instanceof Error ? e : null;
      const name = err?.name ?? "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setCamError(strings.permissionDenied);
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        setCamError(strings.noCamera);
      } else {
        setCamError(strings.unsupported);
      }
      setPhase("cam_error");
    }
  }

  async function stop() {
    await stopScanner();
    setPhase("idle");
    setCamError(null);
  }

  async function back() {
    await stopScanner();
    onBack();
  }

  const isScanning = phase === "scanning";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 16,
          fontWeight: 600,
          color: "var(--app-text)",
        }}
      >
        {strings.title}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 13,
          color: "var(--app-muted)",
          lineHeight: 1.5,
        }}
      >
        {strings.hint}
      </p>

      <div
        id="join-qr-reader"
        style={{
          width: "100%",
          minHeight: 260,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--app-border)",
          background: "var(--app-surface-2)",
        }}
      />

      {camError ? (
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-danger)" }} role="alert">
          {camError}
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!isScanning ? (
          <AppBtn type="button" variant="primary" className="w-full" loading={phase === "starting"} disabled={disabled} onClick={() => void start()}>
            {strings.startCamera}
          </AppBtn>
        ) : (
          <AppBtn type="button" variant="secondary" className="w-full" disabled={disabled} onClick={() => void stop()}>
            {strings.stopCamera}
          </AppBtn>
        )}
        <AppBtn type="button" variant="ghost" className="w-full" disabled={!!disabled} onClick={() => void back()}>
          {strings.back}
        </AppBtn>
      </div>
    </div>
  );
}
