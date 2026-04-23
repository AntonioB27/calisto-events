"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LandingCopy } from "@/lib/i18n";
import {
  AlbumGridScreen,
  GuestWelcomeScreen,
  PhotoPickerScreen,
  UploadProgressScreen,
  PhotoDetailScreen,
  DashboardScreen,
  GuestListScreen,
  ModerationScreen,
  ShareQRScreen,
  DownloadScreen,
} from "@/components/AppScreens";

const SCREEN_COMPONENTS = [
  AlbumGridScreen,
  GuestWelcomeScreen,
  PhotoPickerScreen,
  UploadProgressScreen,
  PhotoDetailScreen,
  DashboardScreen,
  GuestListScreen,
  ModerationScreen,
  ShareQRScreen,
  DownloadScreen,
] as const;
const PREVIEW_SEQUENCE = [0, 9, 1, 6] as const; // Gallery, Download, Guest welcome, Guest list

type AppPreviewWindowProps = { copy: LandingCopy };

function ariaView(copy: LandingCopy, caption: string) {
  return copy.appPreviewViewAriaTemplate.replace("{name}", caption);
}

export function AppPreviewWindow({ copy }: AppPreviewWindowProps) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const captions = useMemo(
    () =>
      copy.appPreviewCaptions.map((label, i) => ({
        label,
        i,
        screenIndex: PREVIEW_SEQUENCE[i] ?? 0,
      })),
    [copy],
  );

  const advance = useCallback(() => setActive((i) => (i + 1) % captions.length), [captions.length]);

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(advance, 3200);
    return () => clearInterval(id);
  }, [advance, hovered]);

  return (
    <section
      className="relative"
      aria-label={copy.appPreviewAriaSection}
      style={{ borderTop: "1px solid var(--hair)", padding: "120px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Section head */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 40,
            marginBottom: 72,
            paddingBottom: 28,
            borderBottom: "1px solid var(--hair)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--plum-2, #A584A6)",
                marginBottom: 14,
              }}
            >
              01 · {copy.appPreviewEyebrow}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "var(--cream)",
                margin: 0,
              }}
            >
              {copy.appPreviewTitlePrefix}{" "}
              <em style={{ fontStyle: "italic", color: "var(--plum-2, #A584A6)" }}>{copy.appPreviewTitleEmphasis}</em>
              {" "}{copy.appPreviewTitleSuffix}
            </h2>
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--cream-4, #6E6758)",
              letterSpacing: "0.1em",
              paddingBottom: 8,
              whiteSpace: "nowrap",
            }}
          >
            {copy.appPreviewMetaLabel}
          </div>
        </div>

        {/* Preview frame */}
        <div
          style={{
            borderRadius: 24,
            border: "1px solid var(--hair-2)",
            background: "linear-gradient(180deg, var(--ink-2, #141019) 0%, var(--ink, #0C0A0F) 100%)",
            overflow: "hidden",
            padding: 28,
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
          }}
        >
          {/* Tabs — horizontally scrollable */}
          <div
            className="app-preview-tabs"
            style={{
              display: "flex",
              gap: 4,
              paddingBottom: 20,
              borderBottom: "1px solid var(--hair)",
              marginBottom: 24,
              overflowX: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {captions.map(({ label, i }) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={ariaView(copy, label)}
                aria-pressed={i === active}
                style={{
                  background: i === active ? "var(--glass-bg-2)" : "transparent",
                  border: "none",
                  color: i === active ? "var(--cream)" : "var(--cream-3, #B5AB99)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  padding: "8px 14px",
                  borderRadius: 8,
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 200ms",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Body: phone + captions */}
          <div
            style={{
              display: "flex",
              gap: 48,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Phone */}
            <div style={{ position: "relative", perspective: "1100px" }}>
              {/* Shadow */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 200,
                  height: 24,
                  background: "radial-gradient(ellipse, rgba(0,0,0,0.28) 0%, transparent 70%)",
                  filter: "blur(10px)",
                }}
              />
              <div
                className="phone-float"
                style={{
                  filter: "drop-shadow(0 28px 44px rgba(0,0,0,0.28)) drop-shadow(0 8px 20px rgba(165,132,166,0.16))",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: 240,
                    height: 506,
                    borderRadius: 42,
                    background: "#050308",
                    padding: 9,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10), inset 0 0 0 2px rgba(0,0,0,0.8)",
                  }}
                >
                  {/* Notch */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 9,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 72,
                      height: 18,
                      background: "#050308",
                      borderRadius: 999,
                      zIndex: 10,
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 34,
                      overflow: "hidden",
                      background: "#120E17",
                      position: "relative",
                    }}
                  >
                    {captions.map(({ i, screenIndex }) => {
                      const Screen = SCREEN_COMPONENTS[screenIndex];
                      return (
                        <div
                          key={i}
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: i === active ? 1 : 0,
                            transition: "opacity 600ms ease",
                          }}
                        >
                          <Screen copy={copy} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Screen glare */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 42,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* Side buttons */}
                  <div aria-hidden style={{ position: "absolute", right: -5, top: 88, width: 4, height: 36, borderRadius: "0 3px 3px 0", background: "#2a2235" }} />
                  <div aria-hidden style={{ position: "absolute", left: -5, top: 76, width: 4, height: 22, borderRadius: "3px 0 0 3px", background: "#2a2235" }} />
                  <div aria-hidden style={{ position: "absolute", left: -5, top: 108, width: 4, height: 36, borderRadius: "3px 0 0 3px", background: "#2a2235" }} />
                  <div aria-hidden style={{ position: "absolute", left: -5, top: 156, width: 4, height: 36, borderRadius: "3px 0 0 3px", background: "#2a2235" }} />
                </div>
              </div>
            </div>

            {/* Captions sidebar */}
            <div
              aria-label={copy.appPreviewAriaThumbs}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                maxWidth: 180,
                maxHeight: 440,
                overflowY: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {captions.map(({ label, i }) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={ariaView(copy, label)}
                  aria-pressed={i === active}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    opacity: i === active ? 1 : 0.25,
                    transition: "opacity 500ms",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      height: 1.5,
                      width: 24,
                      borderRadius: 999,
                      background: i === active ? "var(--plum-2, #A584A6)" : "var(--cream-4, #6E6758)",
                      marginBottom: 6,
                      transition: "all 500ms",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontSize: 14,
                      color: "var(--cream)",
                      margin: 0,
                      fontWeight: 400,
                    }}
                  >
                    {label}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .app-preview-tabs {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
