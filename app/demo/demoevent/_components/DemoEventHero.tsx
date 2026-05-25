"use client";

import { DEMO_EVENT, DEMO_PHOTOS } from "../_data/demo-event";

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const STRIPE_BG = `
  repeating-linear-gradient(
    115deg,
    rgba(255,255,255,0.55) 0 1px,
    transparent 1px 16px
  ),
  linear-gradient(135deg, #E8D7C1 0%, #DCC5A8 55%, #C9AC85 100%)
`.trim();

// Each entry bakes the base rotation into the keyframe names so the
// animation owns the full transform (no conflict with inline style).
const POLAROIDS = [
  { src: DEMO_PHOTOS[0].src, ml: 0,   zIndex: 0, anim: "pol-sway-0", dur: "3.2s", delay: "0s"     },
  { src: DEMO_PHOTOS[1].src, ml: -10, zIndex: 1, anim: "pol-sway-1", dur: "2.7s", delay: "-1.1s"  },
  { src: DEMO_PHOTOS[2].src, ml: -10, zIndex: 2, anim: "pol-sway-2", dur: "3.6s", delay: "-0.6s"  },
];

const KEYFRAMES = `
  @keyframes pol-sway-0 {
    0%, 100% { transform: rotate(-8deg)   translateY(0px);  }
    50%       { transform: rotate(-6.2deg) translateY(-4px); }
  }
  @keyframes pol-sway-1 {
    0%, 100% { transform: rotate(4deg)   translateY(-4px); }
    50%       { transform: rotate(5.8deg) translateY(-8px); }
  }
  @keyframes pol-sway-2 {
    0%, 100% { transform: rotate(-3deg)   translateY(0px);  }
    50%       { transform: rotate(-1.2deg) translateY(-3px); }
  }
  @keyframes pol-sway-stub {
    0%, 100% { transform: rotate(5deg)   translateY(0px);  }
    50%       { transform: rotate(6.8deg) translateY(-2px); }
  }
`;

export function DemoEventHero() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: "relative",
          height: 168,
          borderRadius: 14,
          overflow: "hidden",
          background: STRIPE_BG,
          border: "1px solid #DDD4C5",
          boxShadow: "0 6px 14px -8px rgba(40,25,15,0.18)",
        }}
      >
        {/* Big emoji — bleeds off upper-right, rotated 8° */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -14,
            top: -10,
            fontSize: 168,
            lineHeight: 1,
            filter: "drop-shadow(0 8px 14px rgba(40,25,15,0.25))",
            transform: "rotate(8deg)",
            zIndex: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {DEMO_EVENT.emoji}
        </div>

        {/* Event name — italic directly on stripes, no pill */}
        <div style={{ position: "absolute", left: 16, top: 16, right: 110, zIndex: 3 }}>
          <h2
            style={{
              fontFamily: FS,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 22,
              lineHeight: 1.05,
              color: "#fff",
              letterSpacing: "-0.02em",
              textShadow: "0 2px 6px rgba(40,25,15,0.45)",
              margin: 0,
            }}
          >
            {DEMO_EVENT.name}
          </h2>
        </div>

        {/* Polaroid photos fanned along bottom-left */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 10,
            display: "flex",
            alignItems: "flex-end",
            zIndex: 2,
          }}
        >
          {POLAROIDS.map(({ src, ml, zIndex, anim, dur, delay }) => (
            <div
              key={src}
              style={{
                width: 58,
                height: 70,
                background: "#fff",
                padding: 3.5,
                borderRadius: 2,
                boxShadow: "0 6px 12px -4px rgba(40,25,15,0.32)",
                marginLeft: ml,
                zIndex,
                flexShrink: 0,
                animation: `${anim} ${dur} ease-in-out infinite`,
                animationDelay: delay,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          ))}

          {/* +N more stub */}
          <div
            style={{
              width: 34,
              height: 70,
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              borderRadius: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px -4px rgba(40,25,15,0.25)",
              border: "1px solid rgba(255,255,255,0.95)",
              marginLeft: -6,
              flexShrink: 0,
              animation: "pol-sway-stub 4.1s ease-in-out infinite",
              animationDelay: "-2.0s",
            }}
          >
            <div
              style={{
                fontFamily: FS,
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 15,
                color: "#221509",
                lineHeight: 1,
              }}
            >
              +{DEMO_PHOTOS.length - 3}
            </div>
            <div
              style={{
                fontSize: 6.5,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#9A8570",
                fontFamily: FB,
                marginTop: 2,
              }}
            >
              more
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
