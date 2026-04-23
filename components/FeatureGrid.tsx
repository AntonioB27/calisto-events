import Image from "next/image";
import type { CSSProperties } from "react";
import type { LandingCopy } from "@/lib/i18n";

type FeatureGridProps = { copy: LandingCopy };

const ACCENTS = [
  { color: "var(--plum-2, #A584A6)" },
  { color: "var(--amber, #E6A760)" },
  { color: "var(--amber-2, #F2C08A)" },
  { color: "var(--plum, #8B6A8C)" },
  { color: "var(--amber, #E6A760)" },
  { color: "var(--plum-2, #A584A6)" },
];

const ICONS = [
  <svg key="key" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.5 12.5L19 4M17 6l2-2 2 2-2 2Z" /></svg>,
  <svg key="qr" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M6 6h1v1H6zM17 6h1v1h-1zM6 17h1v1H6z" /></svg>,
  <svg key="gallery" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  <svg key="users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  <svg key="cam" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M23 7L16 12l7 5Z" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  <svg key="dl" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>,
];

export function FeatureGrid({ copy }: FeatureGridProps) {
  return (
    <section
      id="features"
      className="features-section relative scroll-mt-20"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "clamp(72px, 11vw, 120px) 0",
        zIndex: 2,
      }}
    >
      <div className="mx-auto features-section__container" style={{ maxWidth: 1280, padding: "0 32px" }}>
        <header className="features-section__header">
          <div className="features-section__intro">
            <div className="features-section__eyebrow">
              <span className="features-section__eyebrow-mark" aria-hidden />
              <span>{copy.featuresSectionLabel}</span>
            </div>
            <div className="flex w-full items-center gap-4">
              <h2 className="features-section__title" style={{ flex: 1, minWidth: 0 }}>
                {copy.featuresTitle}
              </h2>
              <div className="shrink-0">
                <Image
                  src="/brand/mascot/aurora_camera.png"
                  alt={copy.auroraMascotAlt}
                  width={140}
                  height={140}
                  style={{ width: 100, height: "auto", objectFit: "contain" }}
                />
              </div>
            </div>
            {/* <p className="features-section__lede">{copy.featuresDescription}</p> */}
          </div>
        </header>

        <ul className="features-showcase" role="list" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {copy.features.map((f, i) => {
            const accent = ACCENTS[i % ACCENTS.length]!;
            const Icon = ICONS[i] ?? ICONS[0];
            const idx = String(i + 1);
            return (
              <li key={f.title} className="feature-card">
                <div
                  className="features-lane__plate"
                  style={
                    {
                      ["--lane-accent"]: accent.color,
                    } as CSSProperties
                  }
                >
                  <div className="features-lane__top">
                    {/* <span className="features-lane__index">{idx}</span> */}
                    <div className="features-lane__iconRing">{Icon}</div>
                    <h3 className="features-lane__title">{f.title}</h3>
                  </div>

                  <div className="feature-card-desc-wrap">
                    <div className="feature-card-desc-inner">
                      <p className="feature-card-desc features-lane__desc">{f.description}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
