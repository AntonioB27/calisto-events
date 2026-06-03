import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

function Monstera({ style, color }: { style: React.CSSProperties; color: string }) {
  return (
    <svg viewBox="0 0 200 200" style={style} fill={color}>
      <path d="M100 8 C40 30 12 90 22 168 C24 182 40 188 52 178 C70 120 110 70 168 40 C182 32 178 14 162 12 C140 8 118 4 100 8 Z" opacity="0.9" />
      <path d="M100 30 C70 50 50 95 56 150" stroke="#fff" strokeWidth="2" fill="none" opacity="0.3" />
    </svg>
  );
}

export function QrCardTropical({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(165deg, #eef6ed 0%, #e2f0e3 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <Monstera style={{ position: 'absolute', top: -40, left: -50, width: 220, height: 220, transform: 'rotate(20deg)' }} color="#3c7a52" />
      <Monstera style={{ position: 'absolute', bottom: -50, right: -50, width: 230, height: 230, transform: 'rotate(200deg)' }} color="#4d9466" />
      <div style={{ position: 'absolute', top: 60, right: 78, width: 22, height: 22, borderRadius: '50%', background: '#ff7a59' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '92px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 6, color: '#e06a47', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 62, lineHeight: 0.96, color: '#1f5236', margin: '8px 0 0', fontWeight: 600 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: '#3a6149', margin: '14px auto 0', maxWidth: 340, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#ffffff', borderRadius: 14, boxShadow: '0 16px 34px -18px rgba(31,82,54,0.5)' }}>
          <QRCode value={joinUrl} size={196} fgColor="#1f5236" bgColor="#ffffff" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 4, color: '#4d8060', textTransform: 'uppercase', margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
