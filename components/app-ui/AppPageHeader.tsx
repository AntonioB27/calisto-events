import type { ReactNode } from "react";
import { GoldBar } from "./GoldBar";

type AppPageHeaderProps = Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  showGoldBar?: boolean;
}>;

export function AppPageHeader({
  eyebrow,
  title,
  description,
  actions,
  showGoldBar = true,
}: AppPageHeaderProps) {
  return (
    <header style={{ marginBottom: 28 }}>
      {showGoldBar ? <GoldBar /> : null}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginTop: showGoldBar ? 10 : 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrow ? <p className="app-page-header__eyebrow" style={{ margin: 0 }}>{eyebrow}</p> : null}
          <h1 className="app-page-header__title" style={{ fontSize: eyebrow ? "clamp(1.75rem, 4vw, 2.75rem)" : "clamp(2rem, 4.5vw, 2.75rem)" }}>
            {title}
          </h1>
          {description ? (
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 15,
                color: "var(--app-muted)",
                maxWidth: 520,
                lineHeight: 1.55,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>{actions}</div> : null}
      </div>
    </header>
  );
}
