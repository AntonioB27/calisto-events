"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { appButtonClassNames } from "@/components/app-ui/AppBtn";

export function SettingsPageHeader() {
  const ui = useAppUi();

  return (
    <div className="mb-8 flex items-center justify-between">
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 28,
          color: "var(--app-text)",
        }}
      >
        {ui.settingsPage.title}
      </h1>
      <Link href="/dashboard" className={appButtonClassNames({ variant: "ghost", size: "sm" })}>
        {ui.settingsPage.eventsLink}
      </Link>
    </div>
  );
}
