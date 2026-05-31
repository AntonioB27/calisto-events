"use client";

import { useAppUi } from "@/components/AppUiProvider";

const GOLD_DK = '#A37118';
const FB = "'DM Sans', sans-serif";

export function SettingsPageHeader() {
  const ui = useAppUi();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 20px' }}>
      <span style={{ width: 18, height: 2, background: '#C5922A', borderRadius: 1, flexShrink: 0 }} />
      <h1 style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>
        {ui.settingsPage.title}
      </h1>
    </div>
  );
}
