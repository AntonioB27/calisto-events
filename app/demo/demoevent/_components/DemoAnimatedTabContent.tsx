"use client";

import { useRef } from "react";
import type { DemoTabId } from "../demo-role";

const TAB_ORDER: DemoTabId[] = ["overview", "guests", "gallery", "share"];

const KEYFRAMES = `
  @keyframes _demoSlideFromRight {
    from { transform: translateX(28px); }
    to   { transform: translateX(0); }
  }
  @keyframes _demoSlideFromLeft {
    from { transform: translateX(-28px); }
    to   { transform: translateX(0); }
  }
  ._demoTabEnterRight { animation: _demoSlideFromRight 0.26s cubic-bezier(0.22, 1, 0.36, 1) both; }
  ._demoTabEnterLeft  { animation: _demoSlideFromLeft  0.26s cubic-bezier(0.22, 1, 0.36, 1) both; }
`;

export function DemoAnimatedTabContent({
  selectedTab,
  children,
}: {
  selectedTab: DemoTabId;
  children: React.ReactNode;
}) {
  const stateRef = useRef<{ tab: DemoTabId; key: number; dir: "right" | "left" }>({
    tab: selectedTab,
    key: 0,
    dir: "right",
  });

  const state = stateRef.current;
  if (state.tab !== selectedTab) {
    const prevIdx = TAB_ORDER.indexOf(state.tab);
    const nextIdx = TAB_ORDER.indexOf(selectedTab);
    state.dir = nextIdx > prevIdx ? "right" : "left";
    state.key += 1;
    state.tab = selectedTab;
  }

  const animClass =
    state.key > 0
      ? state.dir === "right"
        ? "_demoTabEnterRight"
        : "_demoTabEnterLeft"
      : "";

  return (
    <>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <div key={state.key} className={animClass}>
        {children}
      </div>
    </>
  );
}
