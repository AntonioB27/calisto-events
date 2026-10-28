"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora } from "@/components/app-ui/Aurora";
import { TabHeader } from "@/components/app-ui/TabHeader";

import "./rsvp-prints.css";

/** Shown below the Standard plan. Plans live in Settings, which only the primary organizer can open. */
export function RsvpUpgradePrompt({ eventId, canChangePlan }: Readonly<{ eventId: string; canChangePlan: boolean }>) {
  const t = useAppUi().rsvpTab;

  return (
    <section className="rsvp-tab">
      <TabHeader title={t.title}>{t.upgradeTitle}</TabHeader>
      <div className="tab-card tab-card--raised rsvp-upsell">
        <Aurora pose="present" size={88} />
        <div className="rsvp-upsell__text">
          <p>{t.upgradeBody}</p>
          {canChangePlan ? (
            <AppBtn as={Link} href={`/events/${eventId}?tab=settings`} variant="gold" className="rsvp-btn">
              {t.upgradeCta}
            </AppBtn>
          ) : (
            <p>{t.upgradeOwnerOnly}</p>
          )}
        </div>
      </div>
    </section>
  );
}
