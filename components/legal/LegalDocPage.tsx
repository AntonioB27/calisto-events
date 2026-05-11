import Link from "next/link";

import type { LegalSection } from "@/lib/legal-copy";
import type { Locale } from "@/lib/i18n";

type LegalDocPageProps = Readonly<{
  locale: Locale;
  title: string;
  sections: readonly LegalSection[];
}>;

export function LegalDocPage({ locale, title, sections }: LegalDocPageProps) {
  return (
    <div className="vibrant-page-bg flex min-h-0 flex-1 flex-col overflow-x-clip">
      <div className="page-vignette" aria-hidden />
      <main className="mx-auto w-full max-w-[720px] flex-1 px-6 py-16 sm:px-8">
        <p style={{ margin: "0 0 24px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--cream-4)" }}>
          <Link
            href={`/${locale}`}
            style={{ color: "var(--gold)", textDecoration: "none" }}
          >
            ← Calisto
          </Link>
        </p>

        {locale !== "en" ? (
          <p
            style={{
              margin: "0 0 28px",
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--cream-3)",
              fontFamily: "var(--font-sans)",
            }}
          >
            The legal text on this page is provided in English.
          </p>
        ) : null}

        <h1
          style={{
            margin: "0 0 32px",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
            fontWeight: 600,
            color: "var(--cream)",
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sections.map((section, si) => (
            <section key={section.title}>
              <h2
                style={{
                  margin: "0 0 12px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--cream-2)",
                }}
              >
                {section.title}
              </h2>
              {section.paragraphs.map((p, pi) => (
                <p
                  key={`${si}-${pi}`}
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "var(--font-sans)",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--cream-3)",
                  }}
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
