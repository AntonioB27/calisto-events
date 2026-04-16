import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: LandingCopy;
};

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="bg-primary-dark px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        <h2
          className="font-extrabold tracking-tight text-white"
          style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
        >
          {copy.howTitle}
        </h2>
        <p className="mt-3 max-w-xl text-lg text-purple-200">{copy.howDescription}</p>

        <ol className="relative mt-12 grid gap-0 sm:grid-cols-3">
          {copy.howItems.map((item, idx) => (
            <li key={item.step} className="relative flex flex-col gap-4 pb-10 sm:pb-0 sm:pr-8">
              {/* Desktop connector */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-10 top-5 hidden h-0.5 w-[calc(100%-2.5rem)] border-t-2 border-dashed border-white/25 sm:block"
                />
              )}
              {/* Mobile connector */}
              {idx < copy.howItems.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 block h-[calc(100%-2.5rem)] w-0.5 border-l-2 border-dashed border-white/25 sm:hidden"
                />
              )}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-extrabold text-zinc-900 shadow-[0_4px_16px_rgba(245,158,11,0.4)]">
                {item.step}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-purple-200">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
