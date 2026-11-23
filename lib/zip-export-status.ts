"use client";

/**
 * Tiny client store so the album's ZIP button can open the ZIP dock (mounted once per event page)
 * and show its live percentage, without the two components knowing about each other.
 */
export type ZipDockStatus = Readonly<{ busy: boolean; pct: number }>;

const IDLE: ZipDockStatus = { busy: false, pct: 0 };
let status: ZipDockStatus = IDLE;
let opener: (() => void) | null = null;
const listeners = new Set<() => void>();

export function setZipDockStatus(next: ZipDockStatus): void {
  if (next.busy === status.busy && next.pct === status.pct) return;
  status = next;
  listeners.forEach((l) => l());
}

export function subscribeZipDockStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getZipDockStatus = (): ZipDockStatus => status;
export const getZipDockServerStatus = (): ZipDockStatus => IDLE;

export function registerZipDockOpener(fn: () => void): () => void {
  opener = fn;
  return () => {
    if (opener === fn) opener = null;
  };
}

export function openZipDock(): void {
  opener?.();
}
