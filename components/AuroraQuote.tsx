import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type AuroraQuoteProps = {
  copy: LandingCopy;
};

export function AuroraQuote({ copy }: AuroraQuoteProps) {
  return (
    <section
      className="relative overflow-hidden bg-ink px-4 py-0 sm:px-6"
      aria-label={copy.auroraQuoteSectionAria}
    >
      {/* ── Warm spotlight emanating from the right ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 55% 90% at 82% 60%, rgba(245,158,11,0.13) 0%, transparent 65%)",
            "radial-gradient(ellipse 35% 60% at 88% 55%, rgba(249,115,22,0.10) 0%, transparent 55%)",
            "radial-gradient(ellipse 70% 50% at 50% 100%, rgba(180,83,201,0.06) 0%, transparent 60%)",
          ].join(", "),
        }}
      />

      {/* ── Diagonal stage-light rays ── */}
      {[
        { rotate: "-18deg", left: "58%",  top: "-10%", opacity: 0.04, width: "1px",   height: "130%" },
        { rotate: "-18deg", left: "63%",  top: "-10%", opacity: 0.06, width: "40px",  height: "130%" },
        { rotate: "-18deg", left: "71%",  top: "-10%", opacity: 0.04, width: "80px",  height: "130%" },
        { rotate: "-18deg", left: "80%",  top: "-10%", opacity: 0.05, width: "2px",   height: "130%" },
        { rotate: "-18deg", left: "86%",  top: "-10%", opacity: 0.03, width: "120px", height: "130%" },
      ].map((ray, i) => (
        <div
          key={i}
          aria-hidden
          className="pointer-events-none absolute origin-top"
          style={{
            left: ray.left,
            top: ray.top,
            width: ray.width,
            height: ray.height,
            transform: `rotate(${ray.rotate})`,
            background: `linear-gradient(to bottom, rgba(245,158,11,${ray.opacity}), transparent)`,
          }}
        />
      ))}

      {/* ── Top amber rule ── */}
      <div
        aria-hidden
        className="relative mx-auto max-w-5xl"
      >
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>

      {/* ── Main layout ── */}
      <div className="relative mx-auto grid max-w-5xl py-20 sm:py-24 lg:grid-cols-[1fr_340px] lg:items-end lg:gap-0">

        {/* Left: quote */}
        <div className="relative pr-0 lg:pr-12">

          {/* Giant decorative open-quote — structural, not floating */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-2 -top-8 select-none font-black leading-none text-amber-400/10 sm:-left-4"
            style={{ fontSize: "clamp(9rem, 22vw, 16rem)", lineHeight: 0.8 }}
          >
            &ldquo;
          </div>

          <blockquote className="relative">
            {/* Label above */}
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-amber-400/70">
              {copy.auroraQuoteIntro}
            </p>

            {/* Quote text — the hero element */}
            <p
              className="font-black italic leading-[1.12] text-white"
              style={{
                fontSize: "clamp(1.65rem, 3.8vw, 2.8rem)",
                letterSpacing: "-0.025em",
                textShadow: "0 0 80px rgba(245,158,11,0.08)",
              }}
            >
              {copy.auroraQuote}
            </p>

            {/* Attribution row */}
            <footer className="mt-8 flex items-center gap-4">
              <div className="h-px w-10 bg-gradient-to-r from-amber-400/60 to-amber-400/10" />
              <cite className="not-italic">
                <span className="text-sm font-bold text-amber-300">{copy.auroraLabel}</span>
                <span className="ml-2 text-xs text-zinc-500">{copy.auroraJobTitle}</span>
              </cite>
            </footer>
          </blockquote>
        </div>

        {/* Right: Aurora mascot — oversized, bleeds bottom */}
        <div className="relative mt-12 flex justify-center lg:mt-0 lg:self-end">
          {/* Halo behind mascot */}
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: "340px",
              height: "340px",
              background: "radial-gradient(ellipse at 50% 80%, rgba(245,158,11,0.18) 0%, rgba(180,83,201,0.08) 40%, transparent 70%)",
              filter: "blur(20px)",
            }}
          />

          <Image
            src="/brand/aurora_photo.png"
            alt={copy.auroraMascotAlt}
            width={500}
            height={500}
            className="relative z-10 h-auto w-full max-w-[260px] object-contain drop-shadow-[0_-8px_48px_rgba(245,158,11,0.2)] lg:max-w-[320px]"
          />
        </div>
      </div>

      {/* ── Bottom amber rule ── */}
      <div className="relative mx-auto max-w-5xl">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </div>
    </section>
  );
}
