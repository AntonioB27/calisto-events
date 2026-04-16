"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

const SCREENSHOTS = [
  { src: "/brand/screenshots/p1.jpeg", label: "Gallery view" },
  { src: "/brand/screenshots/p2.jpeg", label: "Event details" },
  { src: "/brand/screenshots/p3.jpeg", label: "Upload flow" },
] as const;

export function AppPreviewWindow() {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const advance = useCallback(() => {
    setActive((i) => (i + 1) % SCREENSHOTS.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(advance, 3200);
    return () => clearInterval(id);
  }, [advance, isHovered]);

  return (
    <section
      className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24"
      aria-label="App preview"
    >
      {/* Ambient mesh background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 48% 55%, rgba(180,83,201,0.09) 0%, transparent 70%), radial-gradient(ellipse 40% 35% at 70% 30%, rgba(244,63,94,0.05) 0%, transparent 60%)",
        }}
      />

      {/* Decorative grid lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="mx-auto max-w-5xl">
        {/* Section label */}
        <p className="mb-10 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-400 sm:mb-14">
          See it in action
        </p>

        {/* Phone + side thumbnails layout */}
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-16">

          {/* Thumbnail strip — hidden on mobile, left side on desktop */}
          <div
            className="hidden flex-col gap-3 lg:flex"
            aria-label="Screenshot thumbnails"
          >
            {SCREENSHOTS.map((shot, i) => (
              <button
                key={shot.src}
                onClick={() => setActive(i)}
                aria-label={`View ${shot.label}`}
                aria-pressed={i === active}
                className={`group relative h-20 w-10 overflow-hidden rounded-xl border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  i === active
                    ? "border-primary shadow-[0_0_0_3px_rgba(180,83,201,0.2)]"
                    : "border-zinc-200 opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  className="object-cover object-top"
                />
              </button>
            ))}
          </div>

          {/* Phone mockup */}
          <div
            className="relative"
            style={{ perspective: "1100px" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ground shadow */}
            <div
              aria-hidden
              className="absolute -bottom-6 left-1/2 -translate-x-1/2"
              style={{
                width: "220px",
                height: "28px",
                background:
                  "radial-gradient(ellipse, rgba(0,0,0,0.22) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />

            {/* The phone itself */}
            <div
              className="phone-float relative"
              style={{
                filter:
                  "drop-shadow(0 32px 48px rgba(0,0,0,0.22)) drop-shadow(0 8px 20px rgba(180,83,201,0.18))",
              }}
            >
              {/* Outer bezel */}
              <div
                className="relative overflow-hidden bg-zinc-900"
                style={{
                  width: "260px",
                  height: "548px",
                  borderRadius: "44px",
                  padding: "9px",
                  boxShadow:
                    "inset 0 0 0 1px rgba(255,255,255,0.12), inset 0 0 0 2px rgba(0,0,0,0.8)",
                }}
              >
                {/* Screen */}
                <div
                  className="relative h-full w-full overflow-hidden bg-black"
                  style={{ borderRadius: "36px" }}
                >
                  {/* Dynamic island */}
                  <div
                    aria-hidden
                    className="absolute left-1/2 top-2.5 z-20 -translate-x-1/2 bg-black"
                    style={{
                      width: "92px",
                      height: "28px",
                      borderRadius: "20px",
                    }}
                  />

                  {/* Screenshots */}
                  {SCREENSHOTS.map((shot, i) => (
                    <div
                      key={shot.src}
                      className="absolute inset-0"
                      style={{
                        opacity: i === active ? 1 : 0,
                        transition: "opacity 600ms ease",
                      }}
                    >
                      <Image
                        src={shot.src}
                        alt={`Calisto app — ${shot.label}`}
                        fill
                        className="object-cover object-top"
                        priority={i === 0}
                      />
                    </div>
                  ))}

                  {/* Vignette at bottom */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)",
                    }}
                  />
                </div>

                {/* Physical side buttons */}
                <div
                  aria-hidden
                  className="absolute -right-[5px] top-24 w-[4px] rounded-r-sm bg-zinc-700"
                  style={{ height: "38px" }}
                />
                <div
                  aria-hidden
                  className="absolute -left-[5px] top-20 w-[4px] rounded-l-sm bg-zinc-700"
                  style={{ height: "22px" }}
                />
                <div
                  aria-hidden
                  className="absolute -left-[5px] top-[5.5rem] w-[4px] rounded-l-sm bg-zinc-700"
                  style={{ height: "38px" }}
                />
                <div
                  aria-hidden
                  className="absolute -left-[5px] top-[9rem] w-[4px] rounded-l-sm bg-zinc-700"
                  style={{ height: "38px" }}
                />
              </div>

              {/* Glass glare */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  borderRadius: "44px",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, transparent 60%)",
                }}
              />
            </div>
          </div>

          {/* Mobile dot nav — below phone on mobile */}
          <div className="flex items-center gap-2.5 lg:hidden">
            {SCREENSHOTS.map((shot, i) => (
              <button
                key={shot.src}
                onClick={() => setActive(i)}
                aria-label={`View ${shot.label}`}
                aria-pressed={i === active}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  i === active ? "w-6 bg-primary" : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

          {/* Right side: caption */}
          <div className="hidden max-w-[180px] flex-col gap-5 lg:flex">
            {SCREENSHOTS.map((shot, i) => (
              <div
                key={shot.src}
                className="transition-all duration-500"
                style={{ opacity: i === active ? 1 : 0.2 }}
              >
                <div
                  className={`mb-1 h-0.5 w-6 rounded-full transition-all duration-500 ${
                    i === active ? "bg-primary" : "bg-zinc-200"
                  }`}
                />
                <p className="text-xs font-semibold text-zinc-700">{shot.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
