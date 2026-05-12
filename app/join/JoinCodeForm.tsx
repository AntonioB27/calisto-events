"use client";

import { normalizeAccessCode } from "@/lib/access-code";
import { decodeJoinCodeFromScan } from "@/lib/join-code-from-scan";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";

import { JoinQrScanner } from "./JoinQrScanner";

type JoinPreview = {
  title: string;
  eventDate: string | null;
  planId: string | null;
};

export function JoinCodeForm() {
  const ui = useAppUi();
  const router = useRouter();
  const [stage, setStage] = useState<"enter" | "scan" | "choice">("enter");
  const [code, setCode] = useState("");
  const [resolvedCode, setResolvedCode] = useState("");
  const [preview, setPreview] = useState<JoinPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchJoinPreview(normalized: string, source: "form" | "scan"): Promise<boolean> {
    setLoadingPreview(true);
    setError(null);
    try {
      const response = await fetch(`/api/join/preview?code=${encodeURIComponent(normalized)}`);
      if (response.status === 404) {
        setError(ui.joinForm.notFound);
        if (source === "form") setStage("enter");
        return false;
      }
      if (!response.ok) {
        throw new Error(`Preview failed with status ${response.status}`);
      }

      const data = (await response.json()) as JoinPreview;
      setResolvedCode(normalized);
      setPreview(data);
      setStage("choice");
      return true;
    } catch {
      setError(ui.joinForm.genericError);
      if (source === "form") setStage("enter");
      return false;
    } finally {
      setLoadingPreview(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (normalized.length < 4) {
      setError(ui.joinForm.codeTooShort);
      return;
    }

    await fetchJoinPreview(normalized, "form");
  }

  function onChangeCode() {
    setStage("enter");
    setPreview(null);
    setResolvedCode("");
    setError(null);
  }

  function onLogin() {
    const returnTo = `/join/${encodeURIComponent(resolvedCode)}`;
    router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function onContinueAsGuest() {
    router.push(`/join/${encodeURIComponent(resolvedCode)}`);
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
        src="/brand/mascot/aurora_key.png"
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
        {ui.joinForm.title}
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
        {ui.joinForm.subtitle}
      </p>

      <AppCard pad="lg" style={{ width: "100%", borderRadius: 18 }}>
        {stage === "enter" ? (
          <form onSubmit={onSubmit}>
            <AppFormRow label={ui.joinForm.accessCodeLabel} labelFor="access-code" errorText={error}>
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
                {ui.joinForm.hintFormats}
                <strong style={{ fontStyle: "normal" }}>CALISTO-S2UAQ4</strong>
              </p>
            </AppFormRow>

            <AppBtn type="submit" variant="primary" className="mt-6 w-full" loading={loadingPreview}>
              {ui.joinForm.joinCta}
            </AppBtn>
            <AppBtn
              type="button"
              variant="ghost"
              className="mt-3 w-full"
              disabled={loadingPreview}
              onClick={() => {
                setError(null);
                setStage("scan");
              }}
            >
              {ui.joinForm.scanQrInstead}
            </AppBtn>
          </form>
        ) : stage === "scan" ? (
          <div style={{ textAlign: "left" }}>
            {error ? (
              <p
                style={{
                  margin: "0 0 14px",
                  fontSize: 14,
                  color: "var(--app-danger)",
                  lineHeight: 1.45,
                }}
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {loadingPreview ? (
              <p
                style={{
                  margin: "0 0 14px",
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "var(--app-muted)",
                }}
              >
                {ui.common.loading}
              </p>
            ) : null}
            <JoinQrScanner
              disabled={loadingPreview}
              strings={{
                title: ui.joinForm.scanQrTitle,
                hint: ui.joinForm.scanQrHint,
                startCamera: ui.joinForm.scanQrStartCamera,
                stopCamera: ui.joinForm.scanQrStopCamera,
                back: ui.joinForm.scanEnterInstead,
                unsupported: ui.joinForm.scanQrCamUnsupported,
                permissionDenied: ui.joinForm.scanQrPermissionDenied,
                noCamera: ui.joinForm.scanQrNoCamera,
              }}
              onRawScan={async (raw) => {
                const extracted = decodeJoinCodeFromScan(raw);
                if (!extracted) {
                  setError(ui.joinForm.scanInvalidQr);
                  return false;
                }
                setCode(extracted);
                return fetchJoinPreview(extracted, "scan");
              }}
              onBack={() => {
                setStage("enter");
                setError(null);
              }}
            />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                border: "1px solid var(--app-border)",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "left",
                background: "var(--app-surface-2)",
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "var(--app-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {ui.joinForm.previewEyebrow}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 18, fontWeight: 700, color: "var(--app-text)" }}>
                {preview?.title ?? ui.defaults.eventTitle}
              </p>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
                {ui.joinForm.codePrefix} <strong style={{ color: "var(--app-text)" }}>{resolvedCode}</strong>
              </p>
              {preview?.eventDate ? (
                <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--app-muted)" }}>
                  {ui.joinForm.datePrefix} {preview.eventDate}
                </p>
              ) : null}
            </div>

            <AppBtn type="button" variant="primary" className="w-full" onClick={onLogin}>
              {ui.joinForm.haveAccount}
            </AppBtn>
            <AppBtn type="button" variant="secondary" className="w-full" onClick={onContinueAsGuest}>
              {ui.joinForm.guestContinue}
            </AppBtn>
            <AppBtn type="button" variant="ghost" className="w-full" onClick={onChangeCode}>
              {ui.joinForm.changeCode}
            </AppBtn>
          </div>
        )}
      </AppCard>
    </div>
  );
}
