import type { LandingCopy } from "@/lib/i18n";

type PlanCardsProps = {
  copy: LandingCopy;
};

function highlightClass(id: string): string {
  return id === "premium"
    ? "border-2 border-primary bg-primary-tint/50 shadow-md ring-1 ring-primary/20"
    : "border border-zinc-200 bg-white shadow-sm";
}

export function PlanCards({ copy }: PlanCardsProps) {
  return (
    <section id="plans" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{copy.plansTitle}</h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">
          <strong className="font-semibold text-zinc-800">{copy.plansDescriptionStrong}</strong>
          {" — "}
          {copy.plansDescriptionRest}
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {copy.plans.map((plan) => (
            <article
              key={plan.id}
              className={`rounded-2xl p-6 ${highlightClass(plan.id)}`}
              aria-labelledby={`plan-${plan.id}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 id={`plan-${plan.id}`} className="text-xl font-extrabold tracking-wide text-zinc-900">
                  {plan.name}
                </h3>
                {plan.id === "premium" && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
                    {copy.popularBadge}
                  </span>
                )}
              </div>
              <dl className="mt-4 space-y-3">
                {plan.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-2 text-sm sm:grid-cols-[8.5rem_1fr]">
                    <dt className="font-semibold text-zinc-500">{row.label}</dt>
                    <dd className="text-zinc-800">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p className="mt-8 text-sm italic leading-relaxed text-zinc-500">{copy.planFootnote}</p>
      </div>
    </section>
  );
}
