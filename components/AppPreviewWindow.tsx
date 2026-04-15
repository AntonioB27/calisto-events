"use client";

import { useState } from "react";
import Image from "next/image";

const COLUMN_IMAGES = [
  "/brand/screenshots/p1.jpeg",
  "/brand/screenshots/p2.jpeg",
  "/brand/screenshots/p3.jpeg",
] as const;

function Column({
  imageSrc,
  animationClass,
  hiddenClass,
}: {
  imageSrc: string;
  animationClass: string;
  hiddenClass?: string;
}) {
  const loopItems = [imageSrc, "gap", imageSrc, "gap"] as const;
  const [hoveredImageSrc, setHoveredImageSrc] = useState<string | null>(null);

  return (
    <div
      className={`appPreviewColumn relative min-h-0 overflow-hidden rounded-2xl bg-primary-tint/40 ${
        hoveredImageSrc ? "appPreviewColumnHovering" : ""
      } ${hiddenClass ?? ""}`}
      onMouseLeave={() => setHoveredImageSrc(null)}
    >
      <div className={`appPreviewTrack ${animationClass}`}>
        {loopItems.map((item, i) =>
          item === "gap" ? (
            <div key={`gap-${i}`} className="appPreviewItem mb-4 aspect-[5/9] w-full rounded-xl bg-transparent" aria-hidden />
          ) : (
            <div
              key={`${item}-${i}`}
              className="appPreviewItem mb-4 overflow-hidden rounded-xl bg-white/60 shadow-sm last:mb-0"
              onMouseEnter={() => setHoveredImageSrc(item)}
            >
              <Image
                src={item}
                alt="Calisto app screenshot"
                width={500}
                height={900}
                className="h-auto w-full object-cover"
                priority={i < 2}
              />
            </div>
          ),
        )}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-2 transition-opacity duration-300 ${
          hoveredImageSrc ? "opacity-100" : "opacity-0"
        }`}
      >
        {hoveredImageSrc ? (
          <div className="w-full overflow-hidden rounded-xl bg-white/60 shadow-md">
            <Image
              src={hoveredImageSrc}
              alt="Calisto app screenshot centered preview"
              width={500}
              height={900}
              className="h-auto w-full object-cover"
              priority
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AppPreviewWindow() {
  return (
    <section className="px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-primary/20 bg-[#EFEAF8] p-3 shadow-sm sm:p-4">
        <div className="rounded-3xl bg-primary-tint/60 p-4 sm:p-6">
          <div className="grid h-[30rem] gap-3 sm:h-[36rem] sm:grid-cols-2 lg:h-[42rem] lg:grid-cols-3">
            <Column imageSrc={COLUMN_IMAGES[0]} animationClass="appPreviewColFast" />
            <Column imageSrc={COLUMN_IMAGES[1]} animationClass="appPreviewColMedium" hiddenClass="hidden sm:block" />
            <Column imageSrc={COLUMN_IMAGES[2]} animationClass="appPreviewColSlow" hiddenClass="hidden lg:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
