import type { LandingCopy } from "@/lib/i18n";

type FutureRoadmapProps = {
  copy: LandingCopy;
};

export function FutureRoadmap({ copy }: FutureRoadmapProps) {
  return (
    <section id="future" className="scroll-mt-20 border-t border-zinc-200 bg-zinc-50 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{copy.futureTitle}</h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">{copy.futureDescription}</p>
        <ul className="mt-10 space-y-6">
          {copy.futureItems.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex sm:gap-6"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
