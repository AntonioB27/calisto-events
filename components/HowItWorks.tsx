import type { LandingCopy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: LandingCopy;
};

export function HowItWorks({ copy }: HowItWorksProps) {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{copy.howTitle}</h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">{copy.howDescription}</p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {copy.howItems.map((item) => (
            <li key={item.step} className="relative flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white"
                aria-hidden
              >
                {item.step}
              </span>
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
