"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { composeEventTitle } from "@/lib/event-title";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

type SettingsTabProps = Readonly<{
  eventId: string;
  storedEmoji: string;
  storedName: string;
  eventDate: string;
  plan: string;
  accessCode: string;
}>;

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      <GoldBar vertical />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 17,
          color: "var(--app-text)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function SettingsTab({
  eventId,
  storedEmoji,
  storedName,
  eventDate,
  plan,
  accessCode,
}: SettingsTabProps) {
  const router = useRouter();
  const supabase = maybeCreateSupabaseBrowserClient();
  const boxRef = useRef<HTMLDivElement | null>(null);

  const [name, setName] = useState(storedName);
  const [emoji, setEmoji] = useState(storedEmoji);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(storedName);
    setEmoji(storedEmoji);
  }, [storedName, storedEmoji]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (boxRef.current?.contains(target)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [pickerOpen]);

  const formattedDate = (() => {
    try {
      return new Date(eventDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
    } catch {
      return eventDate;
    }
  })();

  async function saveNameAndEmoji() {
    if (!supabase || saving) return;
    const title = composeEventTitle(emoji, name);
    setSaving(true);
    setError(null);
    try {
      const { error: upErr } = await supabase.from("events").update({ title }).eq("id", eventId);
      if (upErr) throw new Error(upErr.message);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  const dirty = name.trim() !== storedName.trim() || emoji.trim() !== storedEmoji.trim();

  if (!supabase) {
    return (
      <section style={{ maxWidth: 640 }}>
        <div
          style={{
            marginTop: 12,
            borderRadius: "var(--app-radius-lg)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-danger) 8%, var(--app-surface))",
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-danger)" }}>
            Supabase not configured
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
            Set <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> in <code>.env.local</code> to edit event settings.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, marginBottom: 10 }} />
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: 42,
            color: "var(--app-text)",
          }}
        >
          Settings
        </h2>
        <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15, color: "var(--app-muted)", marginTop: 4 }}>
          Only you (the primary organizer) see this tab — update how this event appears in Calisto.
        </p>
      </div>

      {error ? (
        <p
          style={{
            marginBottom: 16,
            fontSize: 13,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
          }}
        >
          {error}
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <SectionHeader label="Name & icon" />
          <AppCard pad="lg" style={{ borderRadius: 18 }}>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1fr", maxWidth: 480 }}>
              <AppFormRow label="Event name">
                <AppInput
                  id="settings-event-name"
                  value={name}
                  onChange={setName}
                  placeholder="e.g. Kyle & Laura"
                  maxLength={120}
                />
              </AppFormRow>

              <div ref={boxRef} style={{ position: "relative" }}>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--app-muted)",
                  }}
                >
                  Event icon
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div
                    aria-label="Selected emoji"
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      background: "var(--app-surface-2)",
                      border: "1.5px solid var(--app-border)",
                    }}
                  >
                    {emoji.trim() ? <span className="calisto-emoji-upright">{emoji}</span> : "—"}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <AppBtn type="button" variant="outline" size="sm" onClick={() => setPickerOpen((v) => !v)}>
                      {pickerOpen ? "Close picker" : "Choose emoji"}
                    </AppBtn>
                    <AppBtn type="button" variant="ghost" size="sm" onClick={() => setEmoji("")}>
                      No icon
                    </AppBtn>
                  </div>
                </div>
                {pickerOpen ? (
                  <div
                    role="dialog"
                    aria-label="Emoji picker"
                    style={{
                      marginTop: 12,
                      zIndex: 20,
                      borderRadius: 16,
                      overflow: "hidden",
                      border: "1.5px solid var(--app-border)",
                      boxShadow: "var(--app-shadow-lg)",
                      background: "var(--app-surface)",
                      width: "fit-content",
                      maxWidth: "100%",
                    }}
                  >
                    <EmojiPicker
                      width={320}
                      height={400}
                      lazyLoadEmojis
                      skinTonesDisabled
                      onEmojiClick={(data: EmojiClickData) => {
                        setEmoji(data.emoji);
                        setPickerOpen(false);
                      }}
                    />
                  </div>
                ) : null}
                <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--app-subtle)", lineHeight: 1.45 }}>
                  Shown next to your event title in the header. If you skip an icon, a default is used in the nav only.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <AppBtn type="button" variant="gold" size="sm" disabled={!dirty || saving} loading={saving} onClick={() => void saveNameAndEmoji()}>
                Save changes
              </AppBtn>
              <AppBtn
                type="button"
                variant="ghost"
                size="sm"
                disabled={!dirty || saving}
                onClick={() => {
                  setName(storedName);
                  setEmoji(storedEmoji);
                  setError(null);
                }}
              >
                Reset
              </AppBtn>
            </div>
          </AppCard>
        </div>

        <div>
          <SectionHeader label="Event details" />
          <AppCard pad="lg" style={{ borderRadius: 18 }}>
            <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)", marginBottom: 4 }}>
                  Event date
                </dt>
                <dd style={{ margin: 0, color: "var(--app-text)" }}>{formattedDate}</dd>
              </div>
              <div style={{ height: 1, background: "var(--app-border)" }} />
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)", marginBottom: 4 }}>
                  Plan
                </dt>
                <dd style={{ margin: 0, color: "var(--app-text)", textTransform: "capitalize" }}>{plan}</dd>
              </div>
              <div>
                <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--app-muted)", marginBottom: 4 }}>
                  Guest join code
                </dt>
                <dd style={{ margin: 0, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--app-text)", letterSpacing: "0.04em" }}>{accessCode}</dd>
              </div>
            </dl>
            <p style={{ marginTop: 18, fontSize: 13, color: "var(--app-muted)", lineHeight: 1.5 }}>
              To change the date or plan, contact support or use your plan upgrade flow where available.
            </p>
            <AppBtn as={Link} href="/dashboard" variant="outline" size="sm" style={{ marginTop: 12 }}>
              Back to dashboard
            </AppBtn>
          </AppCard>
        </div>
      </div>
    </section>
  );
}
