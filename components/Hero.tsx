export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-primary-tint/60 to-white px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Event photos &amp; videos
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          One shared album for your wedding or event—guests join with a code, you stay in control.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-600">
          Calisto helps guests upload and browse photos and videos in one place. Organizers get a simple access
          code, optional QR invite, and storage plans that match the size of the celebration—priced once per
          event, not as a monthly subscription.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-bold text-white shadow-md transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Join the waitlist
          </a>
          <a
            href="#plans"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Compare plans
          </a>
        </div>
      </div>
    </section>
  );
}
