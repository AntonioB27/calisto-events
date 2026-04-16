import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteHeaderProps = {
  copy: LandingCopy;
};

export function SiteHeader({ copy }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between gap-4 sm:min-w-[170px]">
            <a
              href="#top"
              className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Image src="/brand/calisto-icon.png" alt="Calisto icon" width={28} height={28} className="rounded-md" />
              Calisto
            </a>
            <a
              href="#waitlist"
              className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:hidden"
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
            {copy.joinWaitlistShort}
          </a>
        </div>
      </div>
    </header>
  );
}
