"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { appButtonClassNames } from "@/components/app-ui/AppBtn";

export function JoinEntryFooter() {
  const ui = useAppUi();
  return (
    <p style={{ marginTop: 8, textAlign: "center", fontSize: 14, color: "var(--app-muted)" }}>
      <Link href="/welcome" className={appButtonClassNames({ variant: "ghost", size: "sm", className: "!inline-flex" })}>
        {ui.joinEntryFooter.howItWorks}
      </Link>
      {" · "}
      <Link href="/" className={appButtonClassNames({ variant: "ghost", size: "sm", className: "!inline-flex" })}>
        {ui.joinEntryFooter.home}
      </Link>
    </p>
  );
}
