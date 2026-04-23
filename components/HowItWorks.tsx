import type { LandingCopy } from "@/lib/i18n";
import type { ReactNode } from "react";

type HowItWorksProps = { copy: LandingCopy };

/** Step 1 — “Create your event” mock: name, date, plan (no QR). */
function CreateEventStepVisual({ copy }: HowItWorksProps) {
  const planLabel = copy.plans[1]?.name ?? "Standard";
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 sm:gap-3">
      <div
        className="rounded-xl border p-2.5 sm:p-3"
        style={{
          borderColor: "var(--hair-strong)",
          background: "var(--glass-bg-2)",
          boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--cream) 4%, transparent)",
        }}
      >
        <div
          className="mb-0.5 flex items-center justify-between gap-2"
        >
          {/* <div
            className="font-mono text-[7.5px] sm:text-[8px] uppercase"
            style={{ letterSpacing: "0.12em", color: "var(--plum-2, #A584A6)" }}
          >
            {copy.howStepPrefix} 1
          </div> */}
          {/* <div
            className="font-mono text-[7.5px] sm:text-[8px]"
            style={{ color: "var(--cream-4, #6E6758)" }}
          >
            {copy.howSetupHint}
          </div> */}
        </div>
        <p
          className="m-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontStyle: "italic",
            lineHeight: 1.2,
            color: "var(--cream)",
            letterSpacing: "-0.01em",
          }}
        >
          {"Maja & Luka"}
        </p>
        <div
          className="mt-2.5 flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--plum-2)]" aria-hidden>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </span>
            <span
              className="font-mono text-[8px] sm:text-[9px]"
              style={{ color: "var(--cream-3, #B5AB99)" }}
            >
              19 July 2026
            </span>
          </div>
          <span
            className="rounded font-mono text-[7.5px] uppercase sm:text-[8px]"
            style={{
              letterSpacing: "0.1em",
              padding: "3px 7px 3px 8px",
              background: "color-mix(in srgb, var(--plum-2) 18%, var(--ink))",
              color: "var(--cream-2, #E8DCC6)",
              border: "1px solid color-mix(in srgb, var(--plum-2) 35%, var(--hair-2))",
            }}
          >
            {planLabel}
          </span>
        </div>
      </div>
      {/* <p
        className="m-0 flex items-center gap-1.5 font-mono text-[8.5px] sm:text-[9px]"
        style={{ color: "var(--plum-2, #A584A6)", letterSpacing: "0.08em" }}
      >
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{
            background: "var(--amber, #E6A760)",
            boxShadow: "0 0 6px color-mix(in srgb, var(--amber) 50%, transparent)",
          }}
          aria-hidden
        />
        {copy.howVisualLive}
        <span className="text-[var(--cream-4)]" aria-hidden>
          ·
        </span>
        {copy.howVisualGuests}
      </p> */}
    </div>
  );
}

function UploadStepVisual({ copy }: HowItWorksProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="relative flex h-[150px] w-[92px] flex-col overflow-hidden rounded-[18px] border p-2"
        style={{
          borderColor: "color-mix(in srgb, var(--plum-2) 45%, var(--hair))",
          background: "linear-gradient(160deg, var(--ink-2) 0%, var(--ink) 100%)",
          boxShadow: "0 12px 28px -18px rgba(0,0,0,0.55)",
        }}
      >
        <span
          className="mx-auto mb-2 h-1.5 w-8 rounded-full"
          style={{ background: "color-mix(in srgb, var(--cream) 10%, transparent)" }}
          aria-hidden
        />
        <div className="rounded-[12px] border px-2 pb-2 pt-2.5" style={{ borderColor: "var(--hair)" }}>
          <p className="m-0 text-center text-[9px]" style={{ color: "var(--cream-3, #B5AB99)" }}>
            {copy.heroMockJoinAlbum}
          </p>
          <p
            className="m-0 mt-1 text-center font-mono text-[9px] uppercase"
            style={{ letterSpacing: "0.12em", color: "var(--cream)" }}
          >
            WEDDING2026
          </p>
        </div>
        <div className="mt-2 flex flex-1 flex-col items-center justify-center rounded-[12px] border p-1.5" style={{ borderColor: "var(--hair)" }}>
          <svg viewBox="0 0 33 33" width="44" height="44" role="presentation">
            <rect width="33" height="33" fill="var(--ink-2)" />
            <rect x="2" y="2" width="9" height="9" fill="var(--cream)" />
            <rect x="4" y="4" width="5" height="5" fill="var(--ink-2)" />
            <rect x="22" y="2" width="9" height="9" fill="var(--cream)" />
            <rect x="24" y="4" width="5" height="5" fill="var(--ink-2)" />
            <rect x="2" y="22" width="9" height="9" fill="var(--cream)" />
            <rect x="4" y="24" width="5" height="5" fill="var(--ink-2)" />
            <rect x="14" y="2" width="3" height="3" fill="var(--cream)" />
            <rect x="12" y="8" width="3" height="3" fill="var(--cream)" />
            <rect x="16" y="8" width="3" height="3" fill="var(--cream)" />
            <rect x="12" y="12" width="3" height="3" fill="var(--cream)" />
            <rect x="16" y="12" width="3" height="3" fill="var(--cream)" />
            <rect x="20" y="12" width="3" height="3" fill="var(--cream)" />
            <rect x="12" y="16" width="3" height="3" fill="var(--cream)" />
            <rect x="18" y="16" width="3" height="3" fill="var(--cream)" />
            <rect x="14" y="20" width="3" height="3" fill="var(--cream)" />
            <rect x="18" y="20" width="3" height="3" fill="var(--cream)" />
            <rect x="22" y="18" width="3" height="3" fill="var(--cream)" />
            <rect x="26" y="16" width="3" height="3" fill="var(--cream)" />
            <rect x="24" y="22" width="3" height="3" fill="var(--cream)" />
            <rect x="18" y="24" width="3" height="3" fill="var(--cream)" />
            <rect x="14" y="26" width="3" height="3" fill="var(--cream)" />
            <rect x="22" y="28" width="3" height="3" fill="var(--cream)" />
          </svg>
          <p className="m-0 mt-1 text-center text-[8px]" style={{ color: "var(--cream-4)" }}>
            {copy.heroMockScanToUpload}
          </p>
        </div>
      </div>
      <div className="ml-3 flex flex-col gap-1.5 text-[9px]" style={{ color: "var(--cream-3, #B5AB99)" }}>
        <div className="rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase" style={{ letterSpacing: "0.12em", borderColor: "var(--hair)" }}>
          {copy.heroMockNoAppNoAccount}
        </div>
        <div className="h-1 w-10 rounded-full" style={{ background: "color-mix(in srgb, var(--plum-2) 40%, transparent)" }} />
        <div className="h-1 w-6 rounded-full" style={{ background: "color-mix(in srgb, var(--cream) 20%, transparent)" }} />
      </div>
    </div>
  );
}

function OrgStepVisual({ copy }: HowItWorksProps) {
  const plus12 = copy.howModerationNewTemplate.replace("{count}", "12");
  const plus8 = copy.howModerationNewTemplate.replace("{count}", "8");
  const rows = [
    { name: "Ana K.", color: "#E6A760", tag: plus12, muted: false },
    { name: "Toni M.", color: "#A584A6", tag: plus8, muted: false },
    { name: "Lena P.", color: "#E6A760", tag: copy.howModerationApproved, muted: true },
    { name: "Marko D.", color: "#A584A6", tag: copy.howModerationApproved, muted: true },
  ];
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5"
          style={{
            background: "color-mix(in srgb, var(--ink) 88%, var(--plum) 2%)",
            border: "1px solid var(--hair)",
            fontSize: 11,
            color: "var(--cream-2, #E8DCC6)",
          }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="h-5 w-5 shrink-0 rounded-full"
              style={{ background: `linear-gradient(135deg, ${r.color}, var(--ink-3, #1C1724))` }}
            />
            <span className="truncate" style={{ fontFamily: "var(--font-sans)", fontSize: 11 }}>
              {r.name}
            </span>
          </div>
          <span
            className="shrink-0 font-mono text-[8px] uppercase"
            style={{
              letterSpacing: "0.08em",
              color: r.muted ? "var(--cream-4, #6E6758)" : "var(--plum-2, #A584A6)",
            }}
          >
            {r.tag}
          </span>
        </div>
      ))}
    </div>
  );
}

function stepVisuals(copy: LandingCopy): ReactNode[] {
  return [
    <CreateEventStepVisual key="create" copy={copy} />,
    <UploadStepVisual key="up" copy={copy} />,
    <OrgStepVisual key="org" copy={copy} />,
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
        padding: "clamp(72px, 12vw, 120px) 0",
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
            <div className="min-w-0 max-w-2xl">
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
              <h2
                className="m-0"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(34px, 4.5vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: "var(--cream)",
                }}
              >
                {copy.howTitle}
              </h2>
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
            {/* <div
              className="shrink-0 self-start rounded-full border font-mono text-[10.5px] sm:min-w-0 sm:self-end sm:text-right sm:text-xs"
              style={{
                borderColor: "var(--hair-strong)",
                background: "var(--glass-bg)",
                color: "var(--cream-3, #B5AB99)",
                letterSpacing: "0.1em",
                padding: "10px 16px 10px 18px",
                lineHeight: 1.3,
                boxShadow: "inset 0 1px 0 color-mix(in srgb, var(--cream) 6%, transparent)",
              }}
            >
              {copy.howSetupHint}
            </div> */}
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
                  <p
                    className="m-0 px-4 pb-3 pt-5 font-mono text-[10.5px] tracking-[0.2em] sm:px-6 sm:pb-4 sm:pt-6"
                    style={{ textTransform: "uppercase", color: "var(--plum-2, #A584A6)" }}
                  >
                    {copy.howStepPrefix} {item.step}
                  </p>
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
          min-height: 160px;
          padding: 18px;
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
            0 0 0 1px color-mix(in srgb, var(--plum) 5%, transparent),
            0 28px 64px -28px rgba(0, 0, 0, 0.55);
          transition: box-shadow 0.35s ease, border-color 0.35s ease, background 0.2s ease;
        }
        html[data-theme="light"] .how-section__card {
          box-shadow:
            0 0 0 1px var(--hair-2),
            0 16px 40px -20px color-mix(in srgb, var(--cream) 12%, rgba(0,0,0,0.1));
        }
        @media (hover: hover) and (pointer: fine) {
          .how-section__card:hover {
            border-color: color-mix(in srgb, var(--plum-2) 28%, var(--hair-2));
            box-shadow:
              0 0 0 1px color-mix(in srgb, var(--plum-2) 12%, transparent),
              0 32px 72px -24px rgba(0, 0, 0, 0.6);
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
