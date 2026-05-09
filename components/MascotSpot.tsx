/** Same column width for `/welcome`, `/auth/login`, and similar heroes. */
export const WELCOME_HERO_COLUMN_MAX_WIDTH_PX = 400;

/** Default hero mascot width (square assets use this height too). */
export const WELCOME_HERO_MASCOT_PX = 168;

/**
 * `aurora_key.png` is 1024×1536 portrait. In a square frame it letterboxes sideways and looks tiny;
 * match welcome’s perceived size by using a 2:3 frame with the same 168px width.
 */
export const WELCOME_HERO_KEY_MASCOT_FRAME_HEIGHT_PX = Math.round((WELCOME_HERO_MASCOT_PX * 1536) / 1024);

type MascotSpotProps = {
  src: string;
  caption?: string;
  size?: number;
  /** Portrait / landscape art: frame height (px). Default: square `size × size`. */
  frameHeight?: number;
  variant?: "inline" | "stack";
  className?: string;
};

/**
 * Consistent fixed-frame mascot with optional bubble text (decorative image + visible caption).
 * Uses `<img>` so hero sizing is stable with Tailwind preflight + mixed aspect ratios.
 */
export function MascotSpot({
  src,
  caption,
  size = 88,
  frameHeight: frameHeightProp,
  variant = "inline",
  className = "",
}: MascotSpotProps) {
  const showCaption = Boolean(caption && caption.trim().length > 0);
  const frameH = frameHeightProp ?? size;
  const frame = (
    <div
      className="mascot-spot__frame"
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: size,
        height: frameH,
        minWidth: size,
        minHeight: frameH,
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed public assets; predictable px frame */}
      <img
        src={src}
        alt=""
        width={size}
        height={frameH}
        className="mascot-spot__img"
        decoding="async"
        style={{
          display: "block",
          width: size,
          height: frameH,
          maxWidth: "none",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </div>
  );

  if (variant === "stack") {
    return (
      <div
        className={`mascot-spot mascot-spot--stack ${className}`.trim()}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}
      >
        {frame}
        {showCaption ? (
          <p
            className="mascot-spot__caption"
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: 12.5,
              lineHeight: 1.45,
              color: "var(--cream-3, #B5AB99)",
              maxWidth: 18,
            }}
          >
            {caption}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`mascot-spot mascot-spot--inline ${className}`.trim()}
      style={{ display: "flex", alignItems: "center", gap: 14 }}
    >
      {frame}
      {showCaption ? (
        <p
          className="mascot-spot__caption"
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            lineHeight: 1.45,
            color: "var(--cream-3, #B5AB99)",
            textAlign: "left",
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
