const nav = [
  { href: "#features", label: "Features" },
  { href: "#plans", label: "Plans" },
  { href: "#future", label: "Future" },
  { href: "#waitlist", label: "Waitlist" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center justify-between gap-4">
          <a
            href="#top"
            className="text-lg font-extrabold tracking-tight text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Calisto
          </a>
          <a
            href="#waitlist"
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:hidden"
          >
            Join waitlist
          </a>
        </div>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:flex-1 sm:justify-end"
          aria-label="Page sections"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-primary-tint hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:px-3 sm:py-2 sm:text-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#waitlist"
          className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:inline-flex sm:shrink-0"
        >
          Join waitlist
        </a>
      </div>
    </header>
  );
}
