"use client";

import { useEffect } from "react";

const BASE_DUR = 4;     // seconds at rest
const MIN_DUR  = 0.7;   // fastest when scrolling hard

/**
 * Speeds up .polaroid-sway animation while the user is scrolling,
 * then eases back to the base duration once scrolling stops.
 * Uses --sway-dur on :root so all polaroids on the page respond.
 */
export function usePolaroidScroll() {
  useEffect(() => {
    let lastY    = 0;
    let lastT    = Date.now();
    let current  = BASE_DUR;
    let resetId  = 0;
    let rafId    = 0;

    function set(dur: number) {
      document.documentElement.style.setProperty("--sway-dur", `${dur.toFixed(2)}s`);
    }

    function easeBack() {
      const diff = BASE_DUR - current;
      if (Math.abs(diff) < 0.05) { current = BASE_DUR; set(current); return; }
      current += diff * 0.06;
      set(current);
      rafId = requestAnimationFrame(easeBack);
    }

    function onScroll(e: Event) {
      const target = e.target as Element | Document;
      const el     = target === document ? document.documentElement : (target as Element);
      const y      = el.scrollTop ?? window.scrollY;
      const now    = Date.now();
      const dt     = Math.max(1, now - lastT);
      const speed  = Math.abs(y - lastY) / dt;   // px / ms

      // faster scroll → shorter duration
      current = Math.max(MIN_DUR, BASE_DUR / (1 + speed * 1.2));
      set(current);

      lastY = y;
      lastT = now;

      clearTimeout(resetId);
      cancelAnimationFrame(rafId);
      resetId = window.setTimeout(() => {
        rafId = requestAnimationFrame(easeBack);
      }, 120);
    }

    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      clearTimeout(resetId);
      cancelAnimationFrame(rafId);
      document.documentElement.style.removeProperty("--sway-dur");
    };
  }, []);
}
