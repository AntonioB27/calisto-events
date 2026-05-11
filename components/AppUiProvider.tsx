"use client";

import { createContext, useContext } from "react";

import type { AppUiSession } from "@/lib/app-ui";

const AppUiContext = createContext<AppUiSession | null>(null);

export function AppUiProvider({ value, children }: Readonly<{ value: AppUiSession; children: React.ReactNode }>) {
  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi(): AppUiSession {
  const v = useContext(AppUiContext);
  if (!v) {
    throw new Error("useAppUi must be used inside AppUiProvider (see app/layout.tsx).");
  }
  return v;
}
