import type { LandingCopy } from "@/lib/i18n";

type StatBarProps = {
  copy: LandingCopy;
};

export function StatBar({ copy }: StatBarProps) {
  return (
    <section className="bg-primary-dark px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {copy.statBar.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center ${
                i < copy.statBar.length - 1
                  ? "sm:border-r sm:border-white/10"
                  : ""
              }`}
            >
              <dt
                className="font-black text-amber-400"
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", letterSpacing: "-0.03em" }}
              >
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs font-bold uppercase tracking-widest text-purple-200">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
