import type { LandingCopy } from "@/lib/i18n";

type LifecycleProps = {
  copy: LandingCopy;
};

export function Lifecycle({ copy }: LifecycleProps) {
  return (
    <section id="lifecycle" className="scroll-mt-20 border-t border-zinc-200 bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{copy.lifecycleTitle}</h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">{copy.lifecycleDescription}</p>
        <ul className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
          {copy.lifecycleRules.map((rule) => (
            <li key={rule} className="flex gap-3 text-zinc-800">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              <span className="leading-relaxed">{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
