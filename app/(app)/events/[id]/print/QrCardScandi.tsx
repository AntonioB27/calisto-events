import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardScandi({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#edeae3', fontFamily: "'Jost', 'DM Sans', sans-serif",
    }}>
      {/* blue header band */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 150, background: '#6b8a9a' }} />
      {/* gold circle accent */}
      <div style={{ position: 'absolute', top: 150, right: 70, width: 70, height: 70, borderRadius: '50%', background: '#d9a441', transform: 'translateY(-50%)' }} />
      {/* arc curve bottom-left */}
      <svg viewBox="0 0 120 120" width="120" height="120" style={{ position: 'absolute', bottom: 40, left: 46 }}>
        <path d="M10 110 A100 100 0 0 1 110 10" fill="none" stroke="#c4664a" strokeWidth="3" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, padding: '200px 54px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontSize: 13, letterSpacing: 6, color: '#8a8576', textTransform: 'uppercase', fontWeight: 500, margin: 0 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 52, lineHeight: 1, color: '#2f3b42', margin: '10px 0 0', fontWeight: 600, letterSpacing: -1 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: '#5f6a70', margin: '14px auto 0', maxWidth: 320, fontWeight: 400 }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 18, background: '#fff', borderRadius: 4, border: '1px solid #ddd8cf', boxShadow: '0 12px 26px -16px rgba(60,70,76,0.4)' }}>
          <QRCode value={joinUrl} size={188} fgColor="#2f3b42" bgColor="#ffffff" />
        </div>
        <p style={{ fontSize: 12, letterSpacing: 4, color: '#8a8576', textTransform: 'uppercase', fontWeight: 500, margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
