import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardBoho({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#f1e4d4', fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {/* terracotta arch */}
      <div style={{
        position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 540,
        background: 'linear-gradient(170deg, #d98b63, #c06b4f)',
        borderRadius: '180px 180px 0 0',
      }} />
      {/* sun rays */}
      <svg viewBox="0 0 200 100" width="200" height="100"
        style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)' }}>
        {[...Array(11)].map((_, i) => {
          const a = (i / 10) * Math.PI;
          return (
            <line key={i} x1={100} y1={92}
              x2={100 - Math.cos(a) * 92} y2={92 - Math.sin(a) * 80}
              stroke="#bb6a48" strokeWidth="2" />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, padding: '108px 70px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 6, color: '#f3ddcf', textTransform: 'uppercase', margin: 0 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 56, lineHeight: 0.98, color: '#fdf3ea', margin: '8px 0 0', fontWeight: 600 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 22, lineHeight: 1.4, color: '#f6e2d4', margin: '12px auto 0', maxWidth: 290, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 18, background: '#fbf2e9', borderRadius: 10, boxShadow: '0 16px 30px -16px rgba(120,60,40,0.55)' }}>
          <QRCode value={joinUrl} size={184} fgColor="#a8553a" bgColor="#fbf2e9" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 4, color: '#a8674c', textTransform: 'uppercase', margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
