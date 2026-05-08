import Link from "next/link";

import { appButtonClassNames } from "@/components/app-ui/AppBtn";
import { JoinCodeForm } from "./JoinCodeForm";

export default function JoinEntryPage() {
  return (
    <main className="join-shell" style={{ minHeight: "100vh", padding: "0 16px" }}>
      <JoinCodeForm />
      <p style={{ marginTop: 8, textAlign: "center", fontSize: 14, color: "var(--app-muted)" }}>
        <Link href="/welcome" className={appButtonClassNames({ variant: "ghost", size: "sm", className: "!inline-flex" })}>
          How Calisto works
        </Link>
        {" · "}
        <Link href="/" className={appButtonClassNames({ variant: "ghost", size: "sm", className: "!inline-flex" })}>
          Home
        </Link>
      </p>
    </main>
  );
}
