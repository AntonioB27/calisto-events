import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type SiteFooterProps = {
  copy: LandingCopy;
};

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer className="bg-[#1a0a2e] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/calisto-icon.png"
              alt="Calisto icon"
              width={24}
              height={24}
              className="rounded-md opacity-80"
            />
            <span className="text-sm font-extrabold tracking-tight">
              <span className="text-white">Calisto</span>
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">{copy.footerText}</p>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Calisto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
