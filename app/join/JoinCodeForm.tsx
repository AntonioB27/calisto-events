"use client";

import { normalizeAccessCode } from "@/lib/access-code";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";

export function JoinCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (normalized.length < 4) {
      setError("Enter the code from your invite (at least 4 characters).");
      return;
    }
    setError(null);
    router.push(`/join/${encodeURIComponent(normalized)}`);
  }

  return (
    <div
      style={{
        padding: "40px 0 60px",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, marginBottom: 24 }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot%2Faurora_key.png&w=384&q=75"
        alt="Aurora"
        style={{ width: 100, height: 100, objectFit: "contain", marginBottom: 4, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}
      />
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 40,
          color: "var(--app-text)",
          marginBottom: 6,
        }}
      >
        Join Event
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--app-muted)",
          marginBottom: 36,
          lineHeight: 1.6,
          maxWidth: 320,
        }}
      >
        Enter the access code shared by your event organizer.
      </p>

      <AppCard pad="lg" style={{ width: "100%", borderRadius: 18 }}>
        <form onSubmit={onSubmit}>
          <AppFormRow label="Access Code" labelFor="access-code" errorText={error}>
            <input
              id="access-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="CALISTO-XXXXXX"
              className="app-input"
              style={{
                padding: "18px 20px",
                fontSize: 22,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "0.12em",
                borderWidth: 2,
                borderColor: code.length > 5 ? "var(--app-gold)" : "var(--app-border)",
                transition: "border-color 0.2s",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--app-muted)",
                marginTop: 10,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Hint: codes look like <strong style={{ fontStyle: "normal" }}>CALISTO-S2UAQ4</strong>
            </p>
          </AppFormRow>

          <AppBtn type="submit" variant="primary" className="mt-6 w-full">
            Join Event →
          </AppBtn>
        </form>
      </AppCard>
    </div>
  );
}
