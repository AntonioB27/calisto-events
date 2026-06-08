"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";

type TestimonialsProps = { copy: LandingCopy };

// Natural resting rotation for each card when inactive
const RESTING_ROT = [-3.2, 0.8, 2.8];

// Washi tape colors
const TAPE_COLOR = [
  "rgba(212,168,67,0.48)",
  "rgba(160,200,160,0.45)",
  "rgba(180,150,220,0.45)",
];


export function Testimonials({ copy }: TestimonialsProps) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const total = copy.testimonials.length;
  const sectionRef = useRef<HTMLElement>(null);
  const pointerStart = useRef<{ x: number; t: number } | null>(null);
  const hasDragged = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // Already in viewport (e.g. scroll restored after navigation) — show immediately
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-advance every 3s; resets whenever active changes (user swipe resets the timer too)
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive(prev => (prev + 1) % total);
    }, 3000);
    return () => clearTimeout(timer);
  }, [active, total]);

  const navigate = useCallback((dir: -1 | 1) => {
    setActive(prev => Math.max(0, Math.min(total - 1, prev + dir)));
  }, [total]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    pointerStart.current = { x: e.clientX, t: Date.now() };
    hasDragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    if (Math.abs(e.clientX - pointerStart.current.x) > 8) hasDragged.current = true;
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dt = Date.now() - pointerStart.current.t;
    if (Math.abs(dx) > 50 || (Math.abs(dx) > 28 && dt < 280)) {
      navigate(dx < 0 ? 1 : -1);
    }
    pointerStart.current = null;
    setTimeout(() => { hasDragged.current = false; }, 40);
  }

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "clamp(24px, 4vw, 40px) 0 clamp(32px, 5vw, 56px)",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 80% at 50% 50%, rgba(230,167,96,0.04) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Section header */}
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px", marginBottom: 16 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "var(--font-mono)", fontSize: "10.5px",
          letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--amber, #E6A760)", marginBottom: 14,
        }}>
          <span aria-hidden style={{
            display: "inline-block", width: 16, height: 1,
            background: "var(--amber, #E6A760)", flexShrink: 0,
          }} />
          {copy.testimonialsSectionLabel}
        </div>
        <div className="flex w-full items-center gap-4">
          <h2 style={{
            fontFamily: "var(--font-display)", fontWeight: 400,
            fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1.05,
            letterSpacing: "-0.02em", color: "var(--cream)", margin: 0,
            flex: 1, minWidth: 0,
          }}>
            {copy.testimonialsTitle}
          </h2>
          <div className="ml-auto shrink-0">
            <Image
              src="/brand/mascot/aurora_happy.png"
              alt={copy.auroraMascotAlt}
              width={140}
              height={140}
              style={{ width: 100, height: "auto", objectFit: "contain" }}
            />
          </div>
        </div>
      </div>

      {/* Carousel viewport */}
      <div
        className="polaroid-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
      >
        <div
          className="polaroid-track"
          style={{ transform: `translateX(calc(${-active} * var(--card-stride)))` }}
        >
          {copy.testimonials.map((t, i) => {
            const isActive = i === active;
            const rot = isActive ? 0 : RESTING_ROT[i % RESTING_ROT.length];
            return (
              <article
                key={t.name}
                className="polaroid-card"
                onClick={() => { if (!hasDragged.current) setActive(i); }}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: `rotate(${rot}deg) scale(${isActive ? 1.04 : 0.92})`,
                  filter: isActive ? "none" : "brightness(0.65) saturate(0.8)",
                  transition: [
                    `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${i * 110}ms`,
                    "transform 480ms cubic-bezier(0.34,1.28,0.64,1)",
                    "filter 360ms ease",
                  ].join(", "),
                  cursor: isActive ? "grab" : "pointer",
                  boxShadow: isActive
                    ? "0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)"
                    : "0 8px 28px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.22)",
                }}
              >
                {/* Washi tape */}
                <div
                  aria-hidden
                  className="polaroid-tape"
                  style={{ background: TAPE_COLOR[i % TAPE_COLOR.length] }}
                />

                {/* Photo area */}
                <div className="polaroid-photo">
                  <Image
                    src={`/testimonials/${i + 1}.jpg`}
                    alt={`${t.name} — ${t.event}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="320px"
                  />
                  <div className="polaroid-photo-grain" />
                  <div className="polaroid-photo-vignette" />
                </div>

                {/* Caption */}
                <div className="polaroid-caption">
                  <div
                    className="polaroid-stars"
                    aria-label="5 out of 5 stars"
                  >
                    {[0,1,2,3,4].map(si => (
                      <span key={si} aria-hidden style={{ color: "#C08820" }}>★</span>
                    ))}
                  </div>

                  <blockquote className="polaroid-quote">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  <footer className="polaroid-footer">
                    <div className="polaroid-name">— {t.name}</div>
                    <div className="polaroid-event">{t.event}</div>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        :root {
          --card-width: 320px;
          --card-gap: 40px;
          --card-stride: calc(var(--card-width) + var(--card-gap));
        }

        .polaroid-viewport {
          overflow: hidden;
          padding: 80px 0;
          cursor: grab;
          touch-action: pan-y;
        }
        .polaroid-viewport:active { cursor: grabbing; }

        .polaroid-track {
          display: flex;
          align-items: center;
          gap: var(--card-gap);
          padding-left: calc(50vw - var(--card-width) / 2);
          padding-right: calc(50vw - var(--card-width) / 2);
          transition: transform 480ms cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .polaroid-card {
          flex-shrink: 0;
          width: var(--card-width);
          background: #faf7f2;
          padding: 10px 10px 40px;
          border-radius: 2px;
          position: relative;
          user-select: none;
          -webkit-user-drag: none;
        }

        .polaroid-tape {
          position: absolute;
          top: -11px;
          left: 50%;
          transform: translateX(-50%) rotate(-1.8deg);
          width: 52px;
          height: 13px;
          border-radius: 2px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.22);
          pointer-events: none;
        }

        .polaroid-photo {
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 1px;
          position: relative;
          overflow: hidden;
        }

        .polaroid-photo-grain {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.5;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        .polaroid-photo-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.38) 100%);
          pointer-events: none;
        }

        .polaroid-caption {
          padding: 14px 4px 0;
        }

        .polaroid-stars {
          display: flex;
          gap: 3px;
          margin-bottom: 9px;
          font-size: 12px;
          line-height: 1;
        }

        .polaroid-quote {
          margin: 0 0 14px;
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: clamp(13px, 1.1vw, 14.5px);
          line-height: 1.6;
          color: #2A1805;
          letter-spacing: -0.01em;
        }

        .polaroid-footer {
          padding-top: 11px;
          border-top: 1px solid rgba(163,113,24,0.2);
        }

        .polaroid-name {
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: 13px;
          color: #3D2206;
          letter-spacing: -0.01em;
          margin-bottom: 3px;
        }

        .polaroid-event {
          font-family: var(--font-mono);
          font-size: 9.5px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #A37020;
        }

        @media (max-width: 640px) {
          :root {
            --card-width: min(280px, calc(100vw - 80px));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .polaroid-track { transition: none !important; }
          .polaroid-card { transition: opacity 300ms ease !important; }
        }
      `}</style>
    </section>
  );
}
