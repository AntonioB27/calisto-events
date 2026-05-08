import Link from "next/link";

import { appButtonClassNames } from "@/components/app-ui/AppBtn";

export default function ResetPasswordSuccessPage() {
  return (
    <main
      className="app-shell"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, margin: "0 auto 12px" }} />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 40,
              color: "var(--app-text)",
              lineHeight: 1,
            }}
          >
            Password updated
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--app-muted)",
              marginTop: 10,
            }}
          >
            You can sign in with your new password.
          </p>
        </div>
        <div
          style={{
            background: "var(--app-card)",
            borderRadius: 18,
            border: "1.5px solid var(--app-border)",
            padding: 32,
            boxShadow: "var(--app-shadow-sm)",
          }}
        >
          <Link href="/auth/login" className={appButtonClassNames({ variant: "primary", size: "lg", className: "w-full" })}>
            Go to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
