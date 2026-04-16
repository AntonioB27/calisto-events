import type { LandingCopy } from "@/lib/i18n";

type LifecycleProps = {
  copy: LandingCopy;
};

export function Lifecycle({ copy }: LifecycleProps) {
  return (
    <section
      id="lifecycle"
      className="scroll-mt-20 bg-ink px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.lifecycleTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-300">{copy.lifecycleDescription}</p>

        <ul className="mt-12 flex flex-col gap-0">
          {copy.lifecycleRules.map((rule, i) => (
            <li key={i} className="relative flex gap-5">
              {/* Left column: number + connector */}
              <div className="flex flex-col items-center">
                <div
                  className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/15 text-sm font-extrabold text-amber-300"
                  style={{ boxShadow: "0 0 16px rgba(245,158,11,0.15)" }}
                >
                  {i + 1}
                </div>
                {i < copy.lifecycleRules.length - 1 && (
                  <div
                    aria-hidden
                    className="mt-1 flex-1 w-px"
                    style={{
                      background: "linear-gradient(to bottom, rgba(245,158,11,0.25), rgba(245,158,11,0.05))",
                      minHeight: "2rem",
                    }}
                  />
                )}
              </div>

              {/* Right column: rule card */}
              <div className={`min-w-0 flex-1 ${i < copy.lifecycleRules.length - 1 ? "pb-6" : ""}`}>
                <div className="group rounded-2xl border border-white/8 bg-white/5 px-5 py-4 transition-all duration-200 hover:bg-white/8">
                  <p className="text-sm leading-relaxed text-zinc-300">{rule}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
