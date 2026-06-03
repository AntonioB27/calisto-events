import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardCoastal({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(170deg, #f3f8f9 0%, #e6f1f2 55%, #dcecef 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <svg viewBox="0 0 560 120" width="560" height="120"
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <path d="M0 60 Q70 30 140 60 T280 60 T420 60 T560 60 V0 H0 Z" fill="#cfe3e8" />
        <path d="M0 40 Q70 12 140 40 T280 40 T420 40 T560 40 V0 H0 Z" fill="#aacdd6" />
      </svg>
      <svg viewBox="0 0 560 120" width="560" height="120"
        style={{ position: 'absolute', bottom: 0, left: 0, transform: 'rotate(180deg)' }}>
        <path d="M0 60 Q70 30 140 60 T280 60 T420 60 T560 60 V0 H0 Z" fill="#cfe3e8" />
        <path d="M0 40 Q70 12 140 40 T280 40 T420 40 T560 40 V0 H0 Z" fill="#aacdd6" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, padding: '128px 52px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ width: 30, height: 1, background: '#6ba0ad', display: 'block' }} />
            <span style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 6, color: '#3d7888', textTransform: 'uppercase' }}>{copy.tagline}</span>
            <span style={{ width: 30, height: 1, background: '#6ba0ad', display: 'block' }} />
          </div>
          <h1 style={{ fontSize: 60, lineHeight: 0.98, color: '#1c4a5a', margin: 0, fontWeight: 600 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: '#436775', margin: '14px auto 0', maxWidth: 350, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#ffffff', borderRadius: 12, border: '1px solid #cde0e4', boxShadow: '0 16px 34px -20px rgba(28,74,90,0.5)' }}>
          <QRCode value={joinUrl} size={196} fgColor="#1c4a5a" bgColor="#ffffff" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 4, color: '#5c8794', margin: 0, textTransform: 'uppercase' }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
