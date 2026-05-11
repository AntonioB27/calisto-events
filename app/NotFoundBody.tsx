"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export function NotFoundBody() {
  const ui = useAppUi();
  const home = `/${DEFAULT_LOCALE}`;
  const welcomeHref = "/welcome";

  return (
    <main className="app-shell flex min-h-[70vh] flex-col items-center justify-center px-6 py-16">
      <p
        style={{
          margin: "0 0 8px",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--app-muted)",
        }}
      >
        {ui.globals.notFoundCode}
      </p>
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.35rem, 3vw, 1.85rem)",
          textAlign: "center",
        }}
      >
        {ui.globals.notFoundTitle}
      </h1>
      <p
        style={{
          margin: "0 0 28px",
          maxWidth: 420,
          fontSize: 14,
          color: "var(--app-muted)",
          textAlign: "center",
          lineHeight: 1.55,
        }}
      >
        {ui.globals.notFoundBody}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        <AppBtn as={Link} href={home} variant="primary">
          {ui.globals.calistoHome}
        </AppBtn>
        <AppBtn as={Link} href={welcomeHref} variant="outline">
          {ui.globals.welcomeLink}
        </AppBtn>
      </div>
    </main>
  );
}
