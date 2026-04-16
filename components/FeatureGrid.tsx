import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

const FEATURE_ICONS = ["🔑", "📱", "🖼️", "👥", "🎞️", "📦"];

// Cycling left-border accent colors per card
const BORDER_COLORS = [
  "border-l-primary",
  "border-l-amber-400",
  "border-l-orange-400",
  "border-l-primary",
  "border-l-amber-400",
  "border-l-orange-400",
];

const ICON_BG = [
  "bg-primary/10 text-primary",
  "bg-amber-400/15 text-amber-600",
  "bg-orange-400/15 text-orange-500",
  "bg-primary/10 text-primary",
  "bg-amber-400/15 text-amber-600",
  "bg-orange-400/15 text-orange-500",
];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section id="features" className="scroll-mt-20 bg-[#fdf6ec] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header row */}
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_minmax(0,300px)] lg:gap-12">
          <div>
            <h2
              className="font-extrabold tracking-tight text-zinc-900"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              {copy.featuresTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
              {copy.featuresDescription}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[260px] shrink-0 lg:mx-0">
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex w-full max-w-xs -translate-x-1/2 -translate-y-full justify-center px-2">
              <p className="pointer-events-auto relative rounded-2xl border border-primary/25 bg-white px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
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
              className={`rounded-[24px] border border-zinc-200 border-l-4 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${BORDER_COLORS[i] ?? "border-l-primary"}`}
            >
              <span className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl ${ICON_BG[i] ?? "bg-primary/10 text-primary"}`}>
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
