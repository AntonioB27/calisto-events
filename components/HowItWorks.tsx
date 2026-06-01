import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";
import type { ReactNode } from "react";

type HowItWorksProps = { copy: LandingCopy };

/** Step 1 — event banner preview matching the real app card design. */
function CreateEventStepVisual({ copy }: HowItWorksProps) {
  const planLabel = copy.plans[3]?.name ?? "Premium";
  return (
    <div className="flex h-full w-full flex-col justify-center gap-3">
      {/* Glass banner — mirrors EventAdminTabs */}
      <div
        style={{
          position: "relative",
          borderRadius: 14,
          overflow: "hidden",
          height: 110,
          background: "rgba(255,255,255,0.07)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(91,45,142,0.35),rgba(123,63,190,0.25))" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.09) 0 2px,transparent 2px 12px)" }} />
        {/* Emoji */}
        <div aria-hidden style={{ position: "absolute", right: -6, bottom: -10, fontSize: 96, lineHeight: 1, opacity: 0.9, transform: "rotate(-8deg)", filter: "drop-shadow(0 4px 10px rgba(40,25,15,0.3))", pointerEvents: "none" }}>
          💍
        </div>
        {/* Name pill */}
        <div style={{ position: "absolute", bottom: 9, left: 10, right: 44, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", borderRadius: 100, padding: "4px 12px", border: "1px solid rgba(255,255,255,0.3)" }}>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 13, color: "rgba(255,255,255,0.95)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 1px 3px rgba(40,25,15,0.4)" }}>
            Ana &amp; Marco&#39;s Wedding
          </span>
        </div>
      </div>

      {/* Date + plan row */}
      <div className="flex items-center gap-2.5">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingRight: 10,
            borderRight: "1px dashed rgba(197,146,42,0.35)",
            minWidth: 44,
          }}
        >
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 7.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cream-4, #6E6758)" }}>Sep</span>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 28, lineHeight: 0.9, color: "var(--gold, #C5922A)", letterSpacing: "-0.03em", marginTop: 2 }}>12</span>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 9.5, color: "var(--cream-4, #6E6758)", marginTop: 2 }}>2026</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)",
              borderRadius: 4,
              padding: "3px 10px",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.55)", flexShrink: 0 }} />
            {planLabel}
          </span>
          <span
            style={{
              display: "inline-block",
              fontFamily: "var(--font-sans)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--plum-2, #A584A6)",
              border: "1.5px solid var(--plum-2, #A584A6)",
              borderRadius: 3,
              padding: "2px 7px",
              opacity: 0.85,
            }}
          >
            Organizer
          </span>
        </div>
      </div>
    </div>
  );
}

/** Step 2 — access code + QR, centered and prominent. */
function UploadStepVisual() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      {/* Access code card */}
      <div
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 14,
          padding: "12px 14px 14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Aurora glow */}
        <div aria-hidden style={{ position: "absolute", bottom: -30, right: -20, width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,79,216,0.45), transparent 65%)", filter: "blur(10px)", pointerEvents: "none" }} />

        <p style={{ margin: "0 0 8px", fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "var(--cream-4, #6E6758)", position: "relative" }}>
          Access code
        </p>

        {/* Code block */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px dashed rgba(255,255,255,0.18)",
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--cream)",
            letterSpacing: "0.14em",
            textAlign: "center",
            marginBottom: 10,
            position: "relative",
          }}
        >
          DEMO00
        </div>

        {/* QR code */}
        <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <svg viewBox="0 0 33 33" width="96" height="96" role="presentation" style={{ borderRadius: 6, background: "rgba(255,255,255,0.92)", padding: 6 }}>
            <rect width="33" height="33" fill="white"/>
            <rect x="2" y="2" width="9" height="9" fill="#221509"/><rect x="4" y="4" width="5" height="5" fill="white"/>
            <rect x="22" y="2" width="9" height="9" fill="#221509"/><rect x="24" y="4" width="5" height="5" fill="white"/>
            <rect x="2" y="22" width="9" height="9" fill="#221509"/><rect x="4" y="24" width="5" height="5" fill="white"/>
            <rect x="14" y="2" width="3" height="3" fill="#221509"/><rect x="12" y="8" width="3" height="3" fill="#221509"/>
            <rect x="16" y="8" width="3" height="3" fill="#221509"/><rect x="12" y="12" width="3" height="3" fill="#221509"/>
            <rect x="16" y="12" width="3" height="3" fill="#221509"/><rect x="20" y="12" width="3" height="3" fill="#221509"/>
            <rect x="12" y="16" width="3" height="3" fill="#221509"/><rect x="18" y="16" width="3" height="3" fill="#221509"/>
            <rect x="14" y="20" width="3" height="3" fill="#221509"/><rect x="18" y="20" width="3" height="3" fill="#221509"/>
            <rect x="22" y="18" width="3" height="3" fill="#221509"/><rect x="26" y="16" width="3" height="3" fill="#221509"/>
            <rect x="24" y="22" width="3" height="3" fill="#221509"/><rect x="18" y="24" width="3" height="3" fill="#221509"/>
            <rect x="14" y="26" width="3" height="3" fill="#221509"/><rect x="22" y="28" width="3" height="3" fill="#221509"/>
          </svg>
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 10, color: "var(--cream-4, #6E6758)", textAlign: "center", lineHeight: 1.5, position: "relative" }}>
          Scan to join · no app needed
        </p>
      </div>
    </div>
  );
}

/** Step 3 — photo grid showing the gallery browsing experience. */
const PREVIEW_PHOTOS = [
  "/demo/photo-01.png", "/demo/photo-02.png", "/demo/photo-03.png",
  "/demo/photo-04.png", "/demo/photo-05.png", "/demo/photo-06.png",
];

function OrgStepVisual() {
  return (
    <div className="flex h-full w-full flex-col gap-2.5">
      {/* Gallery header */}
      <div className="flex items-center justify-between">
        <div>
          <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 8, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--cream-4, #6E6758)" }}>
            Gallery
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15, color: "var(--cream)", lineHeight: 1.1 }}>
            All memories
          </p>
        </div>
        <div className="flex items-center gap-1">
          {["#E6A760", "#A584A6", "#C5922A"].map((c, i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: `linear-gradient(135deg, ${c}, var(--ink-3, #1C1724))`, border: "1.5px solid var(--ink)", marginLeft: i > 0 ? -6 : 0 }} />
          ))}
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 8, color: "var(--cream-4, #6E6758)", marginLeft: 6 }}>33</span>
        </div>
      </div>

      {/* Photo grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4, flex: 1 }}>
        {PREVIEW_PHOTOS.map((src, i) => (
          <div key={src} style={{ position: "relative", aspectRatio: "1/1", borderRadius: 8, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {/* Like badge on first photo */}
            {i === 0 && (
              <div style={{ position: "absolute", top: 5, right: 5, background: "rgba(20,10,5,0.6)", backdropFilter: "blur(4px)", borderRadius: 20, padding: "2px 6px", display: "flex", alignItems: "center", gap: 3 }}>
                <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 13.5C8 13.5 2 9.5 2 5.5a3.5 3.5 0 017-0.35A3.5 3.5 0 0114 5.5c0 4-6 8-6 8z" fill="#E6A760" />
                </svg>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>12</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function stepVisuals(copy: LandingCopy): ReactNode[] {
  return [
    <CreateEventStepVisual key="create" copy={copy} />,
    <UploadStepVisual key="up" />,
    <OrgStepVisual key="org" />,
  ];
}

export function HowItWorks({ copy }: HowItWorksProps) {
  const visuals = stepVisuals(copy);

  return (
    <section
      id="how"
      className="how-section relative scroll-mt-20 overflow-x-clip"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "clamp(24px, 4vw, 40px) 0",
        zIndex: 2,
      }}
    >
      <div className="how-section__ambient pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-8">
        <header
          className="how-section__head mb-12 flex flex-col gap-6 border-b sm:mb-14 sm:gap-8 lg:mb-[72px]"
          style={{ borderColor: "var(--hair)", paddingBottom: 28 }}
        >
          <div className="flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0 w-full">
              <p
                className="m-0 mb-3.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "var(--plum-2, #A584A6)",
                }}
              >
                {copy.howSectionLabel}
              </p>
              <div className="flex w-full items-center gap-4">
                <h2
                  className="m-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 400,
                    fontSize: "clamp(34px, 4.5vw, 64px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    color: "var(--cream)",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {copy.howTitle}
                </h2>
                <div className="ml-auto shrink-0">
                  <Image
                    src="/brand/mascot/aurora_qr.png"
                    alt={copy.auroraMascotAlt}
                    width={140}
                    height={140}
                    style={{ width: 100, height: "auto", objectFit: "contain" }}
                  />
                </div>
              </div>
              {/* <p
                className="m-0 mt-3.5"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "var(--cream-3, #B5AB99)",
                  maxWidth: 520,
                }}
              >
                {copy.howDescription}
              </p> */}
            </div>
            <div className="flex shrink-0 items-center justify-center lg:hidden" />
          </div>
        </header>

        <ol className="how-section__steps m-0 list-none p-0">
          {copy.howItems.map((item, idx) => {
            const visual = visuals[idx] ?? visuals[0];
            return (
              <li
                key={item.step}
                className="how-section__step-item m-0 p-0"
                data-step={item.step}
              >
                <article
                  className="how-section__card reveal h-full"
                  style={{ animationDelay: `${0.05 + idx * 0.09}s` }}
                >
                  <div className="how-section__card-header px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 flex items-center justify-between">
                    <span
                      className="font-mono text-[10.5px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--plum-2, #A584A6)" }}
                    >
                      {copy.howStepPrefix} {item.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontWeight: 700,
                        fontSize: 52,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                        color: "var(--gold, #C5922A)",
                        opacity: 0.18,
                        userSelect: "none",
                      }}
                      aria-hidden
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="how-section__frame relative overflow-hidden">
                    <div className="how-section__frame-glow" aria-hidden />
                    <div className="relative h-full w-full" style={{ minHeight: 124 }}>
                      {visual}
                    </div>
                  </div>
                  <div className="px-4 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                    <h3
                      className="m-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: "clamp(1.2rem, 2.2vw, 1.65rem)",
                        fontWeight: 400,
                        lineHeight: 1.2,
                        color: "var(--cream)",
                        marginBottom: 10,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="m-0"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: "var(--cream-3, #B5AB99)",
                        maxWidth: 360,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        {/* Demo CTA */}
        <div className="mt-12 flex justify-center sm:mt-14">
          <a
            href="/demo"
            className="inline-flex items-center gap-2"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 22px",
              borderRadius: 999,
              background: "transparent",
              color: "var(--cream)",
              border: "1px solid var(--hair-strong)",
              boxShadow: "0 0 0 1px rgba(240,179,75,0.12) inset",
              transition: "all 250ms ease",
              textDecoration: "none",
              letterSpacing: "0.01em",
            }}
          >
            {copy.howDemoCta}
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>

      <style>{`
        .how-section__ambient {
          background:
            radial-gradient(ellipse 55% 50% at 8% 30%, color-mix(in srgb, var(--plum-2) 14%, transparent), transparent 55%),
            radial-gradient(ellipse 50% 45% at 92% 80%, color-mix(in srgb, var(--amber) 8%, transparent), transparent 50%);
        }
        html[data-theme="light"] .how-section__ambient {
          background:
            radial-gradient(ellipse 50% 45% at 10% 25%, color-mix(in srgb, var(--plum) 6%, transparent), transparent 60%),
            radial-gradient(ellipse 45% 40% at 90% 75%, color-mix(in srgb, var(--amber) 5%, transparent), transparent 60%);
        }

        .how-section__frame {
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          min-height: 220px;
          padding: 20px 18px;
          border-bottom: 1px solid var(--hair);
          background: linear-gradient(180deg, var(--ink-3) 0%, var(--ink) 100%);
        }
        .how-section__frame-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background: radial-gradient(300px 120px at 20% 0%, color-mix(in srgb, var(--plum-2) 20%, transparent), transparent 70%);
          opacity: 0.4;
        }
        html[data-theme="light"] .how-section__frame {
          background: linear-gradient(180deg, var(--ink-2) 0%, var(--ink) 100%);
        }
        html[data-theme="light"] .how-section__frame-glow {
          background: radial-gradient(300px 120px at 20% 0%, color-mix(in srgb, var(--plum) 6%, transparent), transparent 70%);
          opacity: 0.5;
        }

        .how-section__steps {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        @media (min-width: 1024px) {
          .how-section__steps {
            flex-direction: row;
            gap: 24px;
            align-items: stretch;
          }
          .how-section__step-item { flex: 1; min-width: 0; }
        }
        .how-section__card {
          height: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          border: 1px solid var(--hair-2);
          background: linear-gradient(160deg, var(--ink-2) 0%, var(--ink) 100%);
          box-shadow:
            0 0 0 1px color-mix(in srgb, var(--plum) 6%, transparent),
            0 24px 56px -16px rgba(0, 0, 0, 0.5),
            0 8px 24px -8px rgba(0, 0, 0, 0.3);
          transition: box-shadow 0.35s ease, border-color 0.35s ease, transform 0.35s ease;
        }
        html[data-theme="light"] .how-section__card {
          box-shadow:
            0 0 0 1px var(--hair-2),
            0 16px 40px -20px color-mix(in srgb, var(--cream) 12%, rgba(0,0,0,0.1));
        }
        @media (hover: hover) and (pointer: fine) {
          .how-section__card:hover {
            border-color: color-mix(in srgb, var(--plum-2) 32%, var(--hair-2));
            transform: translateY(-3px);
            box-shadow:
              0 0 0 1px color-mix(in srgb, var(--plum-2) 14%, transparent),
              0 32px 72px -20px rgba(0, 0, 0, 0.6),
              0 12px 32px -10px rgba(0, 0, 0, 0.35);
          }
          html[data-theme="light"] .how-section__card:hover {
            border-color: color-mix(in srgb, var(--plum) 20%, var(--hair-2));
            box-shadow:
              0 0 0 1px color-mix(in srgb, var(--plum) 10%, transparent),
              0 20px 50px -18px color-mix(in srgb, var(--cream) 8%, rgba(0,0,0,0.12));
          }
        }
        .how-section__head { margin-bottom: 48px; }
        @media (min-width: 640px) {
          .how-section__head { margin-bottom: 56px; }
        }
        @media (min-width: 1024px) {
          .how-section__head { margin-bottom: 72px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .how-section__card.reveal { animation: none !important; opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
