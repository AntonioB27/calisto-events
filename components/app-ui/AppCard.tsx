"use client";

type Pad = "none" | "sm" | "md" | "lg";

type AppCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  pad?: Pad;
  className?: string;
};

const PAD_CLASS: Record<Exclude<Pad, "none">, string> = {
  sm: "app-card--pad-sm",
  md: "app-card--pad-md",
  lg: "app-card--pad-lg",
};

export function AppCard({ children, style = {}, onClick, hover, pad = "md", className = "" }: AppCardProps) {
  const padClass = pad === "none" ? "" : PAD_CLASS[pad];
  const cls = ["app-card", hover ? "app-card--hover" : "", padClass, onClick ? "cursor-pointer" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      onClick={onClick}
      className={cls}
      style={style}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
