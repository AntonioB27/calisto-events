import Link from "next/link";

import { JoinCodeForm } from "./JoinCodeForm";

export default function JoinEntryPage() {
  return (
    <main className="app-shell" style={{ minHeight: '100vh', padding: '0 16px' }}>
      <JoinCodeForm />
      <p style={{ marginTop: 8, textAlign: 'center', fontSize: 14, color: 'var(--app-muted)' }}>
        <Link href="/welcome" style={{ color: 'var(--app-gold)', textDecoration: 'underline' }}>
          How Calisto works
        </Link>
        {" · "}
        <Link href="/" style={{ color: 'var(--app-muted)', textDecoration: 'underline' }}>
          Home
        </Link>
      </p>
    </main>
  );
}
