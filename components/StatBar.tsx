"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LandingCopy } from "@/lib/i18n";

type StatBarProps = { copy: LandingCopy };

function parseStatValue(str: string) {
  const m = str.match(/^([\d,.]+)(.*)/);
  if (!m) return null;
  const raw = parseInt(m[1].replace(/[,.]/g, ""), 10);
  if (isNaN(raw)) return null;
  // Detect period-as-thousands-separator (DE/HR style: "9.000")
  const periodSep = /^\d+\.\d{3}/.test(str);
  return { num: raw, suffix: m[2], periodSep };
}

function StatItem({
  value,
  label,
  index,
  active,
}: {
  value: string;
  label: string;
  index: number;
  active: boolean;
}) {
  const parsed = useMemo(() => parseStatValue(value), [value]);
  const delay = useMemo(() => index * 180, [index]);
  const DURATION = 1400;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || !parsed) return;
    const { num } = parsed;
    const startTime = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - startTime - delay;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const t = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(eased * num));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(num);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, parsed, delay, DURATION]);

  const displayValue = !parsed
    ? value
    : `${count.toLocaleString(parsed.periodSep ? "de-DE" : "en-US")}${parsed.suffix}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      <dt
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: "var(--amber, #E6A760)",
          marginBottom: 8,
        }}
      >
        {displayValue}
      </dt>

      {/* Expanding underline */}
      <div
        aria-hidden
        style={{
          height: 1,
          width: active ? 28 : 0,
          background: "linear-gradient(90deg, transparent, rgba(230,167,96,0.55), transparent)",
          marginBottom: 10,
          transition: `width 600ms cubic-bezier(0.16,1,0.3,1) ${delay + 220}ms`,
        }}
      />

      <dd
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--cream-4, #6E6758)",
        }}
      >
        {label}
      </dd>
    </div>
  );
}

export function StatBar({ copy }: StatBarProps) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Already in viewport (e.g. scroll restored after navigation) — show immediately
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        borderTop: "1px solid var(--hair)",
        borderBottom: "1px solid var(--hair)",
        padding: "24px 0",
        position: "relative",
        zIndex: 2,
        overflow: "hidden",
      }}
    >
      {/* Warm ambient glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 120% at 50% 50%, rgba(230,167,96,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        id="stat-bar-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
        }}
      >
        {copy.statBar.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              borderRight:
                i < copy.statBar.length - 1 ? "1px solid var(--hair)" : undefined,
              padding: "0 32px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <StatItem
              value={stat.value}
              label={stat.label}
              index={i}
              active={visible}
            />
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          #stat-bar-grid {
            grid-template-columns: 1fr !important;
          }
          #stat-bar-grid > div {
            border-right: none !important;
            border-bottom: 1px solid var(--hair);
            padding: 16px !important;
          }
          #stat-bar-grid > div:last-child {
            border-bottom: none !important;
          }
        }
      `}</style>
    </section>
  );
}
