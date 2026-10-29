"use client";

import { Hourglass } from "lucide-react";

import { useAppUi } from "@/components/AppUiProvider";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

/** Middle of the save-the-date cover (`.guest-cover--soon`): "Coming soon" chip, big day count, unit. */
export function CoverCountdown({ days }: Readonly<{ days: number }>) {
  const ui = useAppUi();
  const t = ui.soon;
  const tomorrow = days <= 1;
  const size = tomorrow ? " cover-countdown__num--word" : days >= 100 ? " cover-countdown__num--long" : "";

  return (
    <div className="cover-countdown">
      <span className="cover-countdown__chip">
        <Hourglass size={15} strokeWidth={2} aria-hidden />
        {t.chip}
      </span>
      <span className={`cover-countdown__num${size}`}>{tomorrow ? t.tomorrow : days}</span>
      <span className="cover-countdown__unit">
        {tomorrow ? t.tomorrowUnit : plural(bcp47FromUiLocale(ui.locale), days, t.daysToGo)}
      </span>
    </div>
  );
}
