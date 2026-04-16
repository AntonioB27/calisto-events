import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type AuroraQuoteProps = {
  copy: LandingCopy;
};

export function AuroraQuote({ copy }: AuroraQuoteProps) {
  return (
    <section
      className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-24"
      style={{
        background:
          "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(245,158,11,0.10) 35%, rgba(237,228,245,0.40) 70%, rgba(180,83,201,0.08) 100%)",
      }}
    >
      {/* Decorative large quote mark */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 left-6 select-none font-black text-amber-400/20 sm:left-12"
        style={{ fontSize: "clamp(8rem, 20vw, 14rem)", lineHeight: 1 }}
      >
        &ldquo;
      </span>

      <div className="relative mx-auto max-w-3xl text-center">
        <blockquote>
          <p
            className="font-semibold italic leading-relaxed text-zinc-800"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)" }}
          >
            &ldquo;{copy.auroraQuote}&rdquo;
          </p>
        </blockquote>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.15)]">
            <Image
              src="/brand/aurora-photo.png"
              alt="Aurora"
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">Aurora</p>
            <p className="text-xs text-zinc-500">Your Calisto guide</p>
          </div>
        </div>
      </div>
    </section>
  );
}
