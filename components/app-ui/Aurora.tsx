import Image from "next/image";

export type AuroraPose =
  | "waving"
  | "camera"
  | "gallery"
  | "guests"
  | "happy"
  | "key"
  | "planning"
  | "present"
  | "qr"
  | "photo";

/** Aurora, the mascot. Decorative by default; pass `alt` when she carries meaning on her own. */
export function Aurora({
  pose,
  size,
  alt = "",
  className,
  style,
  priority,
}: Readonly<{
  pose: AuroraPose;
  size: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}>) {
  return (
    <Image
      // clean/ = the same poses with the white sticker border removed, cropped to her outline
      src={`/brand/mascot/clean/aurora_${pose}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      priority={priority}
      className={["aurora-figure", className].filter(Boolean).join(" ")}
      style={{ width: size, height: size, objectFit: "contain", ...style }}
    />
  );
}

/** Aurora's voice: italic serif, visually separate from factual product copy. */
export function AuroraSays({
  children,
  size = 20,
  className,
  style,
}: Readonly<{ children: React.ReactNode; size?: number; className?: string; style?: React.CSSProperties }>) {
  return (
    <p className={["aurora-says", className].filter(Boolean).join(" ")} style={{ fontSize: size, ...style }}>
      {children}
    </p>
  );
}
