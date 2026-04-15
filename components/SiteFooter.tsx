import type { LandingCopy } from "@/lib/i18n";

type SiteFooterProps = {
  copy: LandingCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-zinc-800">Calisto</p>
        <p className="text-sm text-zinc-500">{copy.footerText}</p>
      </div>
    </footer>
  );
}
