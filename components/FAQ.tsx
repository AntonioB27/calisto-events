"use client";

import { useState } from "react";
import type { LandingCopy } from "@/lib/i18n";

type FAQProps = { copy: LandingCopy };

export function FAQ({ copy }: FAQProps) {
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section
      id="faq"
      className="relative"
      style={{ borderTop: "1px solid var(--hair)", padding: "120px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Section head */}
        <div
          style={{
            marginBottom: 72,
            paddingBottom: 28,
            borderBottom: "1px solid var(--hair)",
          }}
        >
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
            05 · Questions
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
            {copy.faqTitle}
          </h2>
        </div>

        {/* Two-column layout */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1.6fr", gap: 80, alignItems: "flex-start" }}
        >
          {/* Left: intro */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14.5,
                lineHeight: 1.6,
                color: "var(--cream-3, #B5AB99)",
                maxWidth: 320,
              }}
            >
              If something isn{"'"}t here, write to{" "}
              <a
                href="mailto:hello@calisto.co"
                style={{
                  color: "var(--amber, #E6A760)",
                  borderBottom: "1px solid rgba(230,167,96,0.3)",
                  textDecoration: "none",
                }}
              >
                hello@calisto.co
              </a>
              . We answer within a day, usually faster.
            </p>
          </div>

          {/* Right: accordion */}
          <div>
            {copy.faq.map((item, i) => {
              const isOpen = openIdx === i;
              return (
                <div
                  key={i}
                  className="faq-item"
                  data-open={isOpen ? "true" : "false"}
                  style={{
                    borderTop: "1px solid var(--hair)",
                    cursor: "pointer",
                  }}
                >
                  {/* Question row */}
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 28,
                      padding: "22px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 20,
                        lineHeight: 1.25,
                        color: "var(--cream)",
                        fontWeight: 400,
                      }}
                    >
                      {item.q}
                    </span>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: `1px solid ${isOpen ? "var(--plum)" : "var(--hair-strong)"}`,
                        background: isOpen ? "var(--plum)" : "transparent",
                        color: isOpen ? "var(--cream)" : "var(--cream-3, #B5AB99)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 200ms",
                        transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>

                  {/* Answer */}
                  <div className="faq-answer">
                    <div
                      className="faq-answer-inner"
                      style={{
                        paddingBottom: isOpen ? 22 : 0,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14.5,
                          lineHeight: 1.6,
                          color: "var(--cream-3, #B5AB99)",
                          maxWidth: 560,
                          margin: 0,
                        }}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Last item bottom border */}
            <div style={{ borderTop: "1px solid var(--hair)" }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          #faq > div > div:last-child {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>
    </section>
  );
}
