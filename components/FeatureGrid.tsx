import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type FeatureGridProps = {
  copy: LandingCopy;
};

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-6 lg:grid-cols-[220px_1fr]">
          <div className="mx-auto w-full max-w-[220px]">
            <Image
              src="/brand/aurora-photo.png"
              alt="Aurora"
              width={440}
              height={440}
              className="h-auto w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{copy.featuresTitle}</h2>
            <p className="mt-3 max-w-2xl text-lg text-zinc-600">{copy.featuresDescription}</p>
          </div>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((f) => (
            <li
              key={f.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <h3 className="text-lg font-bold text-zinc-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{f.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
