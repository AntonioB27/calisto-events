import { Suspense } from "react";

import { AuthCombinedForm } from "../_components/AuthCombinedForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <p style={{ color: "var(--app-muted)", fontSize: 14 }}>Loading…</p>
        </main>
      }
    >
      <AuthCombinedForm />
    </Suspense>
  );
}
