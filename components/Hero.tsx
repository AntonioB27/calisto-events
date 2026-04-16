import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type HeroProps = {
  copy: LandingCopy;
};

export function Hero({ copy }: HeroProps) {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-primary-tint/60 to-white px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">{copy.heroTitle}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">{copy.heroDescription}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroPrimaryCta}
            </a>
            <a
              href="#plans"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copy.heroSecondaryCta}
            </a>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-sm flex-col items-center">
          <p className="mb-3 inline-flex rounded-full border-2 border-primary/40 bg-white px-7 py-3 text-base font-extrabold uppercase tracking-[0.2em] text-primary shadow-[0_10px_28px_rgba(180,83,201,0.28)] ring-2 ring-primary/10">
            {copy.heroBadge}
          </p>
          <div className="relative w-full">
            <Image
              src="/brand/mascot.png"
              alt="Calisto mascot"
              width={560}
              height={560}
              priority
              className="h-auto w-full rounded-2xl object-cover"
            />
            <div className="pointer-events-none absolute left-1/2 z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2 sm:max-w-sm top-[13%]">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/30 bg-white px-4 py-2.5 text-center text-sm font-semibold text-primary shadow-sm">
                {copy.heroIntro}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/30 bg-white"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
