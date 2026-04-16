import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type PlanCardsProps = {
  copy: LandingCopy;
};

const PLAN_ICONS: Record<string, string> = {
  free: "🌱",
  standard: "⭐",
  premium: "💎",
  max: "🚀",
};

export function PlanCards({ copy }: PlanCardsProps) {
  return (
    <section id="plans" className="scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {copy.plansTitle}
            </h2>
            <p className="mt-3 text-lg text-zinc-600">
              <strong className="font-semibold text-zinc-800">{copy.plansDescriptionStrong}</strong>
              {" — "}
              {copy.plansDescriptionRest}
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-[min(100%,280px)] shrink-0 flex-col items-center gap-3 sm:max-w-[300px] lg:mx-0">
            <div className="relative w-full px-1">
              <p className="relative rounded-2xl border border-primary/25 bg-white px-4 py-2.5 text-center text-sm font-semibold leading-snug text-primary shadow-sm">
                {copy.plansAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-primary/25 bg-white"
                />
              </p>
            </div>
            <Image
              src="/brand/mascot/aurora_planning.png"
              alt="Aurora"
              width={1000}
              height={1000}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {copy.plans.map((plan) => {
            const [priceRow, storageRow, ...restRows] = plan.rows;
            const isPopular = plan.id === "premium";
            return (
              <article
                key={plan.id}
                tabIndex={0}
                className={`plan-card overflow-hidden rounded-2xl outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-xl ${
                  isPopular
                    ? "border-2 border-primary shadow-[0_4px_24px_rgba(180,83,201,0.18)]"
                    : "border border-zinc-200 shadow-sm"
                }`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {/* Card header */}
                <div
                  className={`px-6 py-5 ${
                    isPopular
                      ? "bg-gradient-to-r from-primary to-violet-500"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{PLAN_ICONS[plan.id] ?? "📋"}</span>
                      <h3
                        id={`plan-${plan.id}`}
                        className={`text-xl font-extrabold tracking-wide ${
                          isPopular ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {plan.name}
                      </h3>
                    </div>
                    {isPopular && (
                      <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold text-white ring-1 ring-white/30">
                        {copy.popularBadge}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1 text-3xl font-extrabold ${isPopular ? "text-white" : "text-zinc-900"}`}>
                    {priceRow.value}
                  </p>
                  <p className={`text-sm ${isPopular ? "text-white/70" : "text-zinc-500"}`}>
                    {storageRow.label}: {storageRow.value}
                  </p>
                </div>

                {/* Card body */}
                <div className={`px-6 py-4 ${isPopular ? "bg-primary-tint/30" : "bg-white"}`}>
                  <div className="plan-card-extras">
                    <div className="plan-card-extras-inner">
                      <dl className="space-y-3">
                        {restRows.map((row) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-[8rem_1fr] gap-2 text-sm"
                          >
                            <dt className="font-semibold text-zinc-500">{row.label}</dt>
                            <dd className="text-zinc-800">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mt-6 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm italic leading-relaxed text-zinc-500">
          {copy.planFootnote}
        </p>
      </div>
    </section>
  );
}
