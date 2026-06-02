"use client";

import { useEffect, useState } from "react";

const FRAMES = [
  "/brand/mascot/aurora_hourglass_1.png",
  "/brand/mascot/aurora_hourglass_2.png",
  "/brand/mascot/aurora_hourglass_3.png",
] as const;

const INTERVAL_MS = 300;

type Props = {
  size?: number;
  caption?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function AuroraHourglass({ size = 88, caption, className = "", style }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, ...style }}
    >
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        {FRAMES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            width={size}
            height={size}
            decoding="async"
            style={{
              position: i === 0 ? "relative" : "absolute",
              inset: 0,
              width: size,
              height: size,
              objectFit: "contain",
              objectPosition: "center",
              opacity: frame === i ? 1 : 0,
              transition: "opacity 60ms ease",
            }}
          />
        ))}
      </div>
      {caption ? (
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--app-muted, var(--cream-3, #B5AB99))",
            textAlign: "center",
          }}
        >
          {caption}
        </p>
      ) : null}
    </div>
  );
}
