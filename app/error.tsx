"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";

export default function GlobalError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  const ui = useAppUi();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-shell flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      <h1 style={{ margin: "0 0 12px", fontFamily: "var(--font-display)", fontSize: 24 }}>{ui.globals.errorTitle}</h1>
      <p style={{ margin: "0 0 24px", maxWidth: 420, fontSize: 14, color: "var(--app-muted)", textAlign: "center", lineHeight: 1.55 }}>
        {ui.globals.errorBody}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        <AppBtn type="button" variant="primary" onClick={() => reset()}>
          {ui.globals.tryAgain}
        </AppBtn>
        <AppBtn variant="outline" href="/" as={Link}>
          {ui.globals.home}
        </AppBtn>
      </div>
    </main>
  );
}
