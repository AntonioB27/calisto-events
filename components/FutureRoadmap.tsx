import type { LandingCopy } from "@/lib/i18n";

type FutureRoadmapProps = {
  copy: LandingCopy;
};

const STATUS_CONFIG = [
  { label: "Roadmap", className: "bg-violet-100 text-violet-700" },
  { label: "Roadmap", className: "bg-violet-100 text-violet-700" },
  { label: "Planned", className: "bg-blue-100 text-blue-700" },
  { label: "Planned", className: "bg-blue-100 text-blue-700" },
  { label: "Idea", className: "bg-amber-100 text-amber-700" },
];

export function FutureRoadmap({ copy }: FutureRoadmapProps) {
  return (
    <section
      id="future"
      className="scroll-mt-20 border-t border-zinc-200/60 bg-[var(--warm-surface)] px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {copy.futureTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.futureDescription}</p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {copy.futureItems.map((item, i) => {
            const status = STATUS_CONFIG[i] ?? STATUS_CONFIG[STATUS_CONFIG.length - 1];
            return (
              <li
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
