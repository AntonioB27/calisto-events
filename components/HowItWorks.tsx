import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: LandingCopy;
};

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="border-y border-zinc-200/60 bg-[var(--warm-surface)] px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
          {copy.howTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-zinc-600">{copy.howDescription}</p>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-3">
          {copy.howItems.map((item, idx) => (
            <li key={item.step} className="relative flex flex-col gap-4 pb-10 sm:pb-0 sm:pr-8">
              {/* Connector line — desktop horizontal (all but last) */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-10 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] border-t-2 border-dashed border-primary/30 sm:block"
                />
              )}
              {/* Connector line — mobile vertical (all but last) */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 block h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-primary/30 sm:hidden"
                />
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white shadow-[0_4px_12px_rgba(180,83,201,0.3)]">
                {item.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
