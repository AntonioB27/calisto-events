import Image from "next/image";

type MascotSpotProps = {
  src: string;
  caption: string;
  size?: number;
  variant?: "inline" | "stack";
  className?: string;
};

/**
 * Consistent fixed-frame mascot with optional bubble text (decorative image + visible caption).
 */
export function MascotSpot({ src, caption, size = 88, variant = "inline", className = "" }: MascotSpotProps) {
  const frame = (
    <div
      className="mascot-spot__frame"
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className="mascot-spot__img"
        style={{ objectFit: "contain", objectPosition: "center", width: "100%", height: "100%" }}
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
      </div>
    );
  }

  return (
    <div
      className={`mascot-spot mascot-spot--inline ${className}`.trim()}
      style={{ display: "flex", alignItems: "center", gap: 14 }}
    >
      {frame}
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
    </div>
  );
}
