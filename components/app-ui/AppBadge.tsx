type AppBadgeTone = "default" | "accent" | "purple";

type AppBadgeProps = Readonly<{
  children: React.ReactNode;
  tone?: AppBadgeTone;
  className?: string;
}>;

const TONE: Record<AppBadgeTone, string> = {
  default: "app-badge",
  accent: "app-badge app-badge--accent",
  purple: "app-badge app-badge--purple",
};

export function AppBadge({ children, tone = "default", className = "" }: AppBadgeProps) {
  return <span className={[TONE[tone], className].filter(Boolean).join(" ")}>{children}</span>;
}
