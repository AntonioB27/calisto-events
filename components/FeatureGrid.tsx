import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

// Feature icons ordered by position in copy.features array
const FEATURE_ICONS = ["🔑", "📱", "🖼️", "👥", "🎞️", "📦"];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header row */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,320px)] lg:gap-12">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">
              {copy.featuresTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
              {copy.featuresDescription}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[280px] shrink-0 sm:max-w-[300px] lg:mx-0">
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2 sm:max-w-sm">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white/95 px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
                {copy.featuresAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/aurora-photo.png"
              alt="Aurora"
              width={520}
              height={520}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Feature cards */}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f, i) => (
            <li
              key={f.title}
              className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-lg"
            >
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-tint text-xl">
                {FEATURE_ICONS[i] ?? "✨"}
              </span>
              <h3 className="text-base font-bold text-zinc-900">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
