import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

function Sprig({ style, color = '#cfa3a0' }: { style: React.CSSProperties; color?: string }) {
  return (
    <svg viewBox="0 0 120 200" style={style} fill="none" stroke={color}>
      <path d="M60 195 C60 150 60 90 60 20" strokeWidth="1.4" />
      {[...Array(7)].map((_, i) => {
        const y = 40 + i * 22;
        const s = i % 2 === 0 ? 1 : -1;
        return (
          <path
            key={i}
            d={`M60 ${y} C${60 + s * 30} ${y - 6} ${60 + s * 40} ${y - 26} ${60 + s * 14} ${y - 30} C${60 + s * 6} ${y - 18} ${60 + s * 4} ${y - 8} 60 ${y}`}
            strokeWidth="1.1"
          />
        );
      })}
    </svg>
  );
}

export function QrCardRomantic({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'linear-gradient(150deg, #fbeee9 0%, #f9f1ec 45%, #f7ece8 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      overflow: 'hidden',
    }}>
      <Sprig style={{ position: 'absolute', left: -10, top: -16, width: 120, height: 200, opacity: 0.5, transform: 'rotate(14deg)' }} />
      <Sprig style={{ position: 'absolute', right: -10, top: -16, width: 120, height: 200, opacity: 0.5, transform: 'rotate(-14deg) scaleX(-1)' }} color="#d8b08a" />
      <div style={{ position: 'absolute', inset: 28, border: '1px solid rgba(201,139,139,0.35)', borderRadius: 4, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '64px 54px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontSize: 18, letterSpacing: 7, color: '#b08a7a', margin: 0, textTransform: 'uppercase', fontWeight: 600 }}>{copy.tagline}</p>
          <h1 style={{ fontFamily: "'Pinyon Script', 'Dancing Script', cursive", fontSize: 80, lineHeight: 0.92, color: '#8e4a52', margin: '8px 0 0', fontWeight: 400 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 25, lineHeight: 1.4, color: '#7a5b54', margin: '16px auto 0', maxWidth: 360, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{
          padding: 20, background: '#fffdfb', borderRadius: 8,
          boxShadow: '0 18px 40px -18px rgba(142,74,82,0.45)', border: '1px solid #f0dcd6',
        }}>
          <QRCode value={joinUrl} size={200} fgColor="#8e4a52" bgColor="#fffdfb" />
        </div>
        <div>
          <p style={{ fontFamily: "'Pinyon Script', 'Dancing Script', cursive", fontSize: 36, color: '#b08a7a', margin: 0, lineHeight: 1 }}>{copy.cta}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
            <span style={{ width: 30, height: 1, background: '#caa', display: 'block' }} />
            <span style={{ fontSize: 16, letterSpacing: 4, color: '#a07d72', textTransform: 'uppercase' }}>Calisto · {accessCode}</span>
            <span style={{ width: 30, height: 1, background: '#caa', display: 'block' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
