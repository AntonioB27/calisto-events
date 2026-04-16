import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

// Inline SVG icons — no dependency needed
function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <circle cx="7.5" cy="15.5" r="4.5" />
      <path d="M10.5 12.5 L19 4" />
      <path d="M17 6 L19 4 L21 6 L19 8 Z" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h2v2h-2z" />
      <path d="M18 14h3" />
      <path d="M14 18h2" />
      <path d="M18 18h3v3" />
      <path d="M6 6h1v1H6z" fill="currentColor" stroke="none" />
      <path d="M17 6h1v1h-1z" fill="currentColor" stroke="none" />
      <path d="M6 17h1v1H6z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M23 7 L16 12 23 17 Z" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

const ICONS = [KeyIcon, QrIcon, GalleryIcon, UsersIcon, CameraIcon, DownloadIcon];

// Each accent cycles through: purple → amber → coral
const ACCENTS = [
  {
    top:       "bg-[#b453c9]",
    iconBg:    "bg-[#b453c9]/20",
    iconColor: "text-[#d08ae0]",
    glow:      "rgba(180,83,201,0.35)",
    hover:     "hover:border-[#b453c9]/40",
  },
  {
    top:       "bg-amber-400",
    iconBg:    "bg-amber-400/20",
    iconColor: "text-amber-300",
    glow:      "rgba(245,158,11,0.35)",
    hover:     "hover:border-amber-400/40",
  },
  {
    top:       "bg-orange-400",
    iconBg:    "bg-orange-400/20",
    iconColor: "text-orange-300",
    glow:      "rgba(249,115,22,0.35)",
    hover:     "hover:border-orange-400/40",
  },
];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section
      id="features"
      className="relative overflow-x-clip scroll-mt-20 bg-ink px-4 py-20 sm:px-6 sm:py-24"
    >
      {/* Subtle radial ambient behind the cards — width capped to section so mobile does not scroll horizontally */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[min(900px,100%)] max-w-full -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(180,83,201,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header row */}
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_minmax(0,260px)] lg:gap-12">
          <div>
            <h2
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              {copy.featuresTitle}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-300">
              {copy.featuresDescription}
            </p>
          </div>

          {/* Aurora on dark */}
          <div className="relative mx-auto mt-20 w-full max-w-[200px] shrink-0 lg:mx-0 lg:mt-0">
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 flex w-[min(100%,20rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-full justify-center px-2 sm:max-w-sm">
              <p className="pointer-events-auto relative rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold leading-snug text-white shadow-md backdrop-blur-md">
                {copy.featuresAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-ink"
                />
              </p>
            </div>
            <Image
              src="/brand/aurora-photo.png"
              alt={copy.auroraLabel}
              width={520}
              height={520}
              className="h-auto w-full object-contain drop-shadow-[0_16px_32px_rgba(180,83,201,0.25)]"
            />
          </div>
        </div>

        {/* Feature cards */}
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f, i) => {
            const accent = ACCENTS[i % ACCENTS.length]!;
            const Icon = ICONS[i] ?? ICONS[0]!;
            return (
              <li
                key={f.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 transition-all duration-300 hover:bg-white/8 hover:shadow-2xl ${accent.hover}`}
              >
                {/* Colored top accent bar */}
                <div className={`h-[3px] w-full ${accent.top}`} aria-hidden />

                <div className="px-5 py-5">
                  {/* Icon with glow */}
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${accent.iconBg} ${accent.iconColor} transition-all duration-300`}
                    style={{
                      boxShadow: `0 0 0 0 ${accent.glow}`,
                    }}
                  >
                    <Icon />
                  </div>

                  <h3 className="text-sm font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.description}</p>
                </div>

                {/* Subtle inner glow on hover */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 20% 0%, ${accent.glow.replace("0.35", "0.06")} 0%, transparent 70%)`,
                  }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
