import type { LandingCopy } from "@/lib/i18n";

type LifecycleProps = {
  copy: LandingCopy;
};

export function Lifecycle({ copy }: LifecycleProps) {
  return (
    <section
      id="lifecycle"
      className="scroll-mt-20 bg-white px-4 py-20 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-zinc-900"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.lifecycleTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.lifecycleDescription}</p>
        <ul className="mt-10 space-y-6">
          {copy.lifecycleRules.map((rule, i) => (
            <li key={i} className="lifecycle-rule">
              <span
                className="lifecycle-dot"
                aria-hidden
                style={{ background: "#f59e0b", boxShadow: "0 0 0 3px rgba(245,158,11,0.2)" }}
              />
              <p className="text-base leading-relaxed text-zinc-800">{rule}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
