"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LandingCopy } from "@/lib/i18n";

type ScrollSpyNavProps = {
  copy: Pick<LandingCopy, "nav" | "navAriaLabel">;
};

function sectionIdsFromNav(nav: LandingCopy["nav"]): string[] {
  return nav.map((item) => item.href.replace(/^#/, "")).filter(Boolean);
}

function pickActiveSection(ids: string[], lineY: number): string | null {
  let current: string | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= lineY) {
      current = id;
    }
  }
  return current;
}

function headerScanLineY(): number {
  const el = document.querySelector<HTMLElement>(".site-header");
  if (el) {
    return el.getBoundingClientRect().height + 6;
  }
  return 80;
}

export function ScrollSpyNav({ copy }: ScrollSpyNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ids = useMemo(() => sectionIdsFromNav(copy.nav), [copy.nav]);

  const update = useCallback(() => {
    if (ids.length === 0) return;
    const y = headerScanLineY();
    setActiveId(pickActiveSection(ids, y));
  }, [ids]);

  useEffect(() => {
    if (ids.length === 0) return;

    const onScroll = () => {
      update();
    };

    const onResize = () => {
      update();
    };

    update();
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            requestAnimationFrame(update);
          })
        : null;
    if (ro) {
      const header = document.querySelector(".site-header");
      if (header) ro.observe(header);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("hashchange", onScroll);
    const t1 = setTimeout(() => {
      requestAnimationFrame(update);
    }, 0);

    return () => {
      clearTimeout(t1);
      if (ro) {
        ro.disconnect();
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", onScroll);
    };
  }, [ids, update]);

  return (
    <nav
      className="col-span-2 -mx-1 flex w-full min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-0.5 border-t border-[var(--hair-2)] pt-1.5 text-xs
        md:order-2 md:col-span-1 md:mx-0 md:w-auto md:min-w-0 md:flex-1 md:flex-nowrap md:justify-center md:gap-x-[34px] md:gap-y-0 md:border-0 md:pt-0 md:text-[13px]"
      aria-label={copy.navAriaLabel}
    >
      {copy.nav.map((item) => {
        const id = item.href.replace(/^#/, "");
        const isActive = activeId !== null && id === activeId;
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={isActive ? "location" : undefined}
            className={isActive ? "nav-link nav-link--active" : "nav-link"}
            style={{
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.02em",
              padding: "6px 4px",
              transition: "color 200ms, font-weight 200ms",
              textDecoration: "none",
              ...(!isActive && {
                color: "var(--cream-2, #E8DCC6)",
                fontWeight: 400,
              }),
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
