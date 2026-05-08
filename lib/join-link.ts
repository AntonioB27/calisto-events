import { normalizeAccessCode } from "@/lib/access-code";

export type InviteTemplate = "short" | "friendly" | "formal";

export function getWebJoinUrl(publicOrigin: string, accessCode: string): string {
  const base = publicOrigin.replace(/\/$/, "");
  const code = normalizeAccessCode(accessCode);
  return `${base}/join/${encodeURIComponent(code)}`;
}

const defaultLabels = {
  code: "Access code",
  link: "Join link",
  introShort: "Join our event:",
  introFriendly: "You're invited to",
  introFormal: "You are cordially invited to",
  ctaShort: "Hope to see you there!",
  ctaFriendly: "Can't wait to celebrate with you!",
  ctaFormal: "We would be honored by your presence.",
} as const;

export function buildEventInviteShareText(input: {
  eventTitle: string;
  accessCode: string;
  joinLink: string;
  template: InviteTemplate;
  labels?: Partial<typeof defaultLabels>;
}): string {
  const labels = { ...defaultLabels, ...input.labels };
  const title = input.eventTitle.trim() || "Event";
  const code = normalizeAccessCode(input.accessCode);
  const link = input.joinLink.trim();
  const intro =
    input.template === "short"
      ? labels.introShort
      : input.template === "formal"
        ? labels.introFormal
        : labels.introFriendly;
  const cta =
    input.template === "short"
      ? labels.ctaShort
      : input.template === "formal"
        ? labels.ctaFormal
        : labels.ctaFriendly;

  return `${intro} ${title}\n\n${labels.code}: ${code}\n${labels.link}: ${link}\n\n${cta}`;
}
