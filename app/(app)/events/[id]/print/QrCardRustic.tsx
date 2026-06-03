import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardRustic({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#c9a87c', fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      {/* kraft paper texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(45deg, rgba(120,90,55,0.05) 0 6px, transparent 6px 12px)',
      }} />
      {/* inner label panel */}
      <div style={{ position: 'absolute', inset: 34, border: '2px solid #6e4f2f', borderRadius: 3, opacity: 0.7, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '74px 58px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <svg width="56" height="40" viewBox="0 0 56 40" style={{ marginBottom: 4 }}>
            <path d="M4 8 H52 M8 8 L28 26 L48 8 M8 32 H48" stroke="#5c4228" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 6, color: '#6e4f2f', textTransform: 'uppercase', margin: '6px 0 0' }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 60, lineHeight: 0.96, color: '#43301c', margin: '8px 0 0', fontWeight: 600 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 22, lineHeight: 1.4, color: '#5c4228', margin: '12px auto 0', maxWidth: 330, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{
          padding: 18, background: '#f5ead5', borderRadius: 4,
          boxShadow: '0 14px 28px -16px rgba(60,40,20,0.6)', border: '1px solid #b59a72',
        }}>
          <QRCode value={joinUrl} size={188} fgColor="#43301c" bgColor="#f5ead5" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 4, color: '#6e4f2f', textTransform: 'uppercase', margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
