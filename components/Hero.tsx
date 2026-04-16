import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type HeroProps = {
  copy: LandingCopy;
};

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="hero-glow relative overflow-hidden border-b border-zinc-200/60 px-4 py-16 sm:px-6 sm:py-28"
    >
      {/* Subtle decorative rings in top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-primary/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-primary/10"
      />

      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
            {copy.heroBadge}
          </span>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
            {copy.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
            {copy.heroDescription}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-bold text-white shadow-[0_4px_20px_rgba(180,83,201,0.35)] transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroPrimaryCta}
            </a>
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white/80 px-7 py-3.5 text-base font-semibold text-zinc-800 backdrop-blur-sm transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroSecondaryCta}
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
          <div className="relative w-full">
            {/* Speech bubble */}
            <div className="pointer-events-none absolute left-1/2 z-10 flex w-full max-w-xs -translate-x-1/2 justify-center px-2 sm:max-w-sm top-[10%] -translate-y-full">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white/95 px-4 py-3 text-center text-sm font-semibold leading-snug text-primary shadow-md backdrop-blur-sm">
                {copy.heroIntro}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/mascot.png"
              alt="Calisto mascot Aurora"
              width={560}
              height={560}
              priority
              className="h-auto w-full rounded-3xl object-cover shadow-[0_8px_40px_rgba(180,83,201,0.15)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
