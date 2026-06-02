import Link from "next/link";
import type { LinkProps } from "next/link";

export type AppBtnVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "gold"
  | "danger"
  | "dangerSolid"
  /** @deprecated use secondary */
  | "white";

export type AppBtnSize = "sm" | "md" | "lg";

export function appButtonClassNames(opts: {
  variant?: AppBtnVariant;
  size?: AppBtnSize;
  /** @deprecated use size="sm" */
  small?: boolean;
  className?: string;
}): string {
  const rawVariant = opts.variant ?? "primary";
  const variant = rawVariant === "white" ? "secondary" : rawVariant;
  const size: AppBtnSize = opts.small ? "sm" : opts.size ?? "md";
  return ["app-btn", `app-btn--${variant}`, `app-btn--${size}`, opts.className].filter(Boolean).join(" ");
}

export type AppBtnProps = Readonly<
  {
    variant?: AppBtnVariant;
    size?: AppBtnSize;
    /** @deprecated use size="sm" */
    small?: boolean;
    loading?: boolean;
    className?: string;
    style?: React.CSSProperties;
    /** When using `href` / `as={Link}`, maps to `aria-disabled` where appropriate. */
    disabled?: boolean;
    children: React.ReactNode;
  } & (
    | ({ href?: undefined; as?: "button" } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">)
    | ({ href: string; as?: "a" } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className">)
    | ({ href: string; as: typeof Link } & Omit<LinkProps, "className" | "children">)
  )
>;

export function AppBtn(props: AppBtnProps) {
  const {
    variant = "primary",
    size = "md",
    small,
    loading = false,
    className,
    style,
    children,
    disabled,
    ...rest
  } = props;

  const classes = appButtonClassNames({ variant, size, small, className });
  const busy = Boolean(loading);
  const isDisabled = Boolean(disabled) || busy;

  const inner = loading ? (
    <>
      <span
        aria-hidden
        style={{
          width: 14,
          height: 14,
          border: "2px solid color-mix(in srgb, currentColor 30%, transparent)",
          borderTopColor: "currentColor",
          borderRadius: "50%",
          display: "inline-block",
          flexShrink: 0,
          animation: "appBtnSpin 0.7s linear infinite",
        }}
      />
      {children}
    </>
  ) : (
    children
  );

  if ("href" in props && props.href && "as" in props && props.as === Link) {
    const { href: _href, as: _as, prefetch, replace, scroll, shallow, passHref, locale, onClick, ...linkRest } = rest as Omit<
      LinkProps,
      "href" | "children" | "className"
    > & { href: string; as?: unknown };
    return (
      <Link
        href={props.href}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        passHref={passHref}
        locale={locale}
        {...linkRest}
        className={classes}
        style={style}
        aria-disabled={isDisabled || undefined}
        aria-busy={busy || undefined}
        onClick={isDisabled ? (e) => e.preventDefault() : onClick}
      >
        {inner}
      </Link>
    );
  }

  if ("href" in props && props.href) {
    const anchorRest = rest as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children">;
    return (
      <a
        href={props.href}
        {...anchorRest}
        className={classes}
        style={style}
        aria-disabled={isDisabled || undefined}
        aria-busy={busy || undefined}
      >
        {inner}
      </a>
    );
  }

  const btnRest = rest as Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;
  return (
    <button
      type={btnRest.type ?? "button"}
      {...btnRest}
      disabled={isDisabled}
      className={classes}
      style={style}
      aria-busy={busy || undefined}
    >
      {inner}
    </button>
  );
}
