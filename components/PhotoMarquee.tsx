import Image from "next/image";

const SCREENSHOTS = [
  "/brand/screenshots/p1.jpeg",
  "/brand/screenshots/p2.jpeg",
  "/brand/screenshots/p3.jpeg",
];

// Duplicate for seamless loop
const ROW1 = [...SCREENSHOTS, ...SCREENSHOTS];
const ROW2 = [...SCREENSHOTS, ...SCREENSHOTS].reverse();

export function PhotoMarquee() {
  return (
    <section
      aria-hidden
      className="overflow-hidden bg-ink py-6 sm:py-8"
    >
      {/* Row 1: scrolls left */}
      <div className="relative flex overflow-hidden">
        <div className="marquee-track marquee-left flex gap-3 pr-3">
          {ROW1.map((src, i) => (
            <div
              key={`r1-${i}`}
              className="h-32 w-auto shrink-0 overflow-hidden rounded-2xl shadow-lg sm:h-40"
            >
              <Image
                src={src}
                alt=""
                width={180}
                height={360}
                className="h-full w-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: scrolls right */}
      <div className="relative mt-3 flex overflow-hidden">
        <div className="marquee-track marquee-right flex gap-3 pr-3">
          {ROW2.map((src, i) => (
            <div
              key={`r2-${i}`}
              className="h-24 w-auto shrink-0 overflow-hidden rounded-2xl opacity-70 shadow-md sm:h-32"
            >
              <Image
                src={src}
                alt=""
                width={180}
                height={360}
                className="h-full w-auto object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
