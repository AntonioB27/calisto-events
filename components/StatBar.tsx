const STATS = [
  { value: "50+",    label: "guests on Free plan" },
  { value: "100 GB", label: "max storage available" },
  { value: "3",      label: "steps to your gallery" },
] as const;

export function StatBar() {
  return (
    <section className="bg-primary-dark px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center text-center ${
                i < STATS.length - 1
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
