import { interpolate } from "@/lib/app-ui/interpolate";

export type CountdownFormatStrings = Readonly<{
  countdownJoin: string;
  countdownDayOne: string;
  countdownDayMany: string;
  countdownHourOne: string;
  countdownHourMany: string;
  countdownMinuteOne: string;
  countdownMinuteMany: string;
  countdownSubMinute: string;
  /** Shown when the deadline is already in the past (or remaining time is non-positive). */
  ended: string;
}>;

/** @deprecated Use `CountdownFormatStrings` */
export type UploadWindowCountdownStrings = CountdownFormatStrings;

function pluralUnit(n: number, oneTpl: string, manyTpl: string): string {
  return n === 1 ? interpolate(oneTpl, { n }) : interpolate(manyTpl, { n });
}

/** Human-readable countdown for a future deadline; non-positive `remainingMs` returns `d.ended`. */
export function formatCountdownRemaining(remainingMs: number, d: CountdownFormatStrings): string {
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    return d.ended;
  }

  const totalSec = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(pluralUnit(days, d.countdownDayOne, d.countdownDayMany));
    if (hours > 0) parts.push(pluralUnit(hours, d.countdownHourOne, d.countdownHourMany));
  } else if (hours > 0) {
    parts.push(pluralUnit(hours, d.countdownHourOne, d.countdownHourMany));
    if (minutes > 0) parts.push(pluralUnit(minutes, d.countdownMinuteOne, d.countdownMinuteMany));
  } else if (minutes > 0) {
    parts.push(pluralUnit(minutes, d.countdownMinuteOne, d.countdownMinuteMany));
  } else {
    return d.countdownSubMinute;
  }

  return parts.join(d.countdownJoin);
}

/** @deprecated Use `formatCountdownRemaining` */
export function formatTimeUntilUploadWindowEnd(remainingMs: number, d: CountdownFormatStrings): string {
  return formatCountdownRemaining(remainingMs, d);
}
