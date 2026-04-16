import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteHeaderProps = {
  copy: LandingCopy;
};

export function SiteHeader({ copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between gap-4 sm:min-w-[170px]">
            <a
              href="#top"
              className="inline-flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
            >
              <Image
                src="/brand/calisto-icon.png"
                alt={copy.brandIconAlt}
                width={28}
                height={28}
                className="rounded-md"
              />
              <span className="text-lg font-extrabold tracking-tight">
                <span className="text-white">Calisto</span>
              </span>
            </a>
            <a
              href="#waitlist"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:hidden"
            >
              {copy.joinWaitlistShort}
            </a>
          </div>
          <nav
            className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:flex-1"
            aria-label={copy.navAriaLabel}
          >
            {copy.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative rounded-lg px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-3 sm:py-2 sm:text-sm"
              >
                {item.label}
                <span
                  aria-hidden
                  className="absolute bottom-0.5 left-2.5 h-0.5 w-0 rounded-full bg-orange-400 transition-all duration-200 group-hover:w-[calc(100%-1.25rem)] sm:left-3 sm:group-hover:w-[calc(100%-1.5rem)]"
                />
              </a>
            ))}
          </nav>
          <a
            href="#waitlist"
            className="hidden rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-zinc-900 transition hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:inline-flex sm:shrink-0"
          >
            {copy.joinWaitlistShort}
          </a>
        </div>
      </div>
    </header>
  );
}
