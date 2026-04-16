import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type HeroProps = {
  copy: LandingCopy;
};

const CONFETTI = [
  { w: 10, h: 10, color: "#b453c9", top: "15%", left: "7%",  delay: "0s",   dur: "2.8s" },
  { w: 7,  h: 7,  color: "#f59e0b", top: "28%", left: "91%", delay: "0.6s", dur: "3.1s" },
  { w: 14, h: 5,  color: "#f97316", top: "60%", left: "4%",  delay: "1.1s", dur: "2.5s" },
  { w: 8,  h: 8,  color: "#f59e0b", top: "72%", left: "86%", delay: "0.3s", dur: "3.4s" },
  { w: 12, h: 12, color: "#b453c9", top: "42%", left: "95%", delay: "1.5s", dur: "2.9s" },
  { w: 6,  h: 6,  color: "#f97316", top: "85%", left: "12%", delay: "0.9s", dur: "3.2s" },
  { w: 9,  h: 9,  color: "#f59e0b", top: "10%", left: "55%", delay: "0.4s", dur: "2.6s" },
  { w: 5,  h: 14, color: "#b453c9", top: "50%", left: "2%",  delay: "1.8s", dur: "3.0s" },
  { w: 11, h: 4,  color: "#f59e0b", top: "80%", left: "75%", delay: "0.7s", dur: "2.7s" },
  { w: 7,  h: 7,  color: "#f97316", top: "35%", left: "78%", delay: "1.3s", dur: "3.3s" },
];

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink px-4 py-20 sm:px-6 sm:py-28"
    >
      {/* Confetti dots */}
      {CONFETTI.map((dot, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute animate-pulse opacity-70"
          style={{
            width: dot.w,
            height: dot.h,
            background: dot.color,
            top: dot.top,
            left: dot.left,
            animationDelay: dot.delay,
            animationDuration: dot.dur,
            borderRadius: dot.w === dot.h ? "50%" : "3px",
          }}
        />
      ))}

      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 50%, rgba(180,83,201,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        {/* Left: text */}
        <div>
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-300">
            ✨ {copy.heroBadge}
          </span>
          <h1
            className="font-black text-white"
            style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4.6rem)",
              letterSpacing: "-0.04em",
              lineHeight: "1.06",
            }}
          >
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-300">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-base font-bold text-zinc-900 shadow-[0_6px_24px_rgba(245,158,11,0.4)] transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              {copy.heroPrimaryCta}
            </a>
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              {copy.heroSecondaryCta}
            </a>
          </div>
        </div>

        {/* Right: Aurora */}
        <div className="relative mx-auto w-full max-w-sm">
          {/* Decorative rings */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
          />

          {/* Speech bubble */}
          <div className="pointer-events-none absolute left-1/2 top-[10%] z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2">
            <p className="pointer-events-auto relative rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-sm font-semibold leading-snug text-white shadow-md backdrop-blur-md">
              {copy.heroIntro}
              <span
                aria-hidden
                className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/20 bg-ink"
              />
            </p>
          </div>

          <Image
            src="/brand/mascot.png"
            alt={copy.auroraMascotAlt}
            width={500}
            height={500}
            priority
            className="relative z-10 h-auto w-full drop-shadow-[0_20px_40px_rgba(180,83,201,0.3)]"
          />
        </div>
      </div>
    </section>
  );
}
