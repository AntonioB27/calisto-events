import type { LandingCopy } from "@/lib/i18n";
import { isFoundingEventsPromotionActive } from "@/lib/founding-events-promotion";

export function LaunchAnnouncement({ copy }: { copy: LandingCopy }) {
  if (!isFoundingEventsPromotionActive()) return null;
  return (
    <a href="#plans" className="launch-announcement">
      <span className="launch-announcement__badge">−50%</span>
      <span>{copy.launchOffer.announcement}</span>
      <span className="launch-announcement__link">{copy.launchOffer.plansLink} <span aria-hidden>→</span></span>
    </a>
  );
}

export function LaunchHeroOffer({ copy, href }: { copy: LandingCopy; href: string }) {
  return (
    <aside className="launch-hero-offer" aria-label={copy.launchOffer.label}>
      <div className="launch-hero-offer__label"><span className="launch-discount-badge">−50%</span> {copy.launchOffer.label}</div>
      <h2>{copy.launchOffer.headline}</h2>
      <p>{copy.launchOffer.details}</p>
      <a className="launch-hero-offer__cta" href={href}>{copy.launchOffer.cta}<span aria-hidden>→</span></a>
      <p className="launch-hero-offer__timing">{copy.launchOffer.timing}</p>
      <a className="launch-hero-offer__plans" href="#plans">{copy.launchOffer.plansLink}</a>
    </aside>
  );
}
