import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

const STARS: Array<[number, number, number]> = [
  [60,70,12],[120,150,7],[470,90,9],[420,180,6],[80,500,8],
  [500,560,11],[460,680,7],[110,640,6],[300,40,8],[510,300,6],
];

function Star({ x, y, s, c = '#e7c879' }: { x: number; y: number; s: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}
      style={{ position: 'absolute', left: x, top: y, opacity: 0.9 }}>
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

export function QrCardCelestial({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'radial-gradient(130% 100% at 50% 8%, #283a6b 0%, #16224a 45%, #0c1430 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {STARS.map((s, i) => <Star key={i} x={s[0]} y={s[1]} s={s[2]} />)}
      <svg width="120" height="120" viewBox="0 0 100 100"
        style={{ position: 'absolute', top: 54, right: 46, opacity: 0.9 }}>
        <path d="M70 12 a40 40 0 1 0 18 62 a32 32 0 1 1 -18 -62 Z"
          fill="none" stroke="#e7c879" strokeWidth="1.4" />
      </svg>
      <div style={{ position: 'absolute', inset: 26, border: '1px solid rgba(231,200,121,0.4)', borderRadius: 3, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '120px 52px 60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 14, letterSpacing: 8, color: '#c9b27a', margin: 0, textTransform: 'uppercase' }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 62, lineHeight: 0.96, color: '#f4eede', margin: '10px 0 0', fontWeight: 500 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: '#b9c2dc', margin: '16px auto 0', maxWidth: 360, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#fbf8ef', borderRadius: 10, boxShadow: '0 18px 44px -16px rgba(0,0,0,0.6)' }}>
          <QRCode value={joinUrl} size={196} fgColor="#16224a" bgColor="#fbf8ef" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 5, color: '#8c93b0', margin: 0 }}>
          CALISTO · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
