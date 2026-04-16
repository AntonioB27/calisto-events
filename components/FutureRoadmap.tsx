import type { LandingCopy } from "@/lib/i18n";

type FutureRoadmapProps = {
  copy: LandingCopy;
};

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

// Derive status from description keywords — keeps it flexible without hardcoding per-item
function deriveStatus(description: string): "roadmap" | "planned" | "idea" {
  const lower = description.toLowerCase();
  if (lower.startsWith("roadmap")) return "roadmap";
  if (lower.startsWith("planned")) return "planned";
  return "idea";
}

const STATUS_STYLES = {
  roadmap: {
    badge: "bg-violet-400/15 text-violet-300 border border-violet-400/25",
    label: "Roadmap",
    icon: MapIcon,
    topBar: "bg-violet-400/60",
    glow: "rgba(167,139,250,0.08)",
  },
  planned: {
    badge: "bg-blue-400/15 text-blue-300 border border-blue-400/25",
    label: "Planned",
    icon: CalendarIcon,
    topBar: "bg-blue-400/60",
    glow: "rgba(96,165,250,0.08)",
  },
  idea: {
    badge: "bg-amber-400/15 text-amber-300 border border-amber-400/25",
    label: "Idea",
    icon: LightbulbIcon,
    topBar: "bg-amber-400/60",
    glow: "rgba(245,158,11,0.08)",
  },
} as const;

export function FutureRoadmap({ copy }: FutureRoadmapProps) {
  return (
    <section
      id="future"
      className="scroll-mt-20 bg-[#1a0a2e] px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.futureTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-300">{copy.futureDescription}</p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.futureItems.map((item) => {
            const statusKey = deriveStatus(item.description);
            const style = STATUS_STYLES[statusKey];
            const Icon = style.icon;
            return (
              <li
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/5 transition-all duration-200 hover:bg-white/8"
              >
                {/* Colored top bar */}
                <div className={`h-[3px] w-full ${style.topBar}`} aria-hidden />

                {/* Hover inner glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 80% 50% at 20% 0%, ${style.glow} 0%, transparent 70%)`,
                  }}
                />

                <div className="relative px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${style.badge}`}>
                      <Icon />
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
