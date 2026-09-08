"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { LandingCopy, Locale } from "@/lib/i18n";
import { ScrollSpyNav } from "@/components/ScrollSpyNav";
import { LanguageSelectorBar } from "@/components/LanguageSelectorBar";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";

type MobileNavMenuProps = {
  copy: LandingCopy;
  locale: Locale;
  ctaHref: string;
  ctaLabel: string;
};

export function MobileNavMenu({ copy, locale, ctaHref, ctaLabel }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? copy.menuCloseLabel : copy.menuOpenLabel}
        aria-expanded={open}
        style={{
          width: 36,
          height: 36,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          cursor: "pointer",
          background: "transparent",
          border: "1px solid var(--hair-2)",
          color: "var(--cream-3)",
          flexShrink: 0,
        }}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 10,
            right: 10,
            borderRadius: 20,
            border: "1px solid var(--hair-2)",
            background: "var(--panel-a)",
            boxShadow: "0 30px 70px -20px rgba(0,0,0,0.7)",
            padding: "8px 18px 18px",
            zIndex: 60,
          }}
        >
          <ScrollSpyNav copy={copy} variant="stack" onNavigate={() => setOpen(false)} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14 }}>
            <LanguageSelectorBar copy={copy} locale={locale} variant="header" />
            <ThemeToggleButton copy={copy} />
          </div>

          <a
            href={ctaHref}
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 14,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              height: 44,
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              textDecoration: "none",
            }}
          >
            {ctaLabel}
            <span aria-hidden>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
