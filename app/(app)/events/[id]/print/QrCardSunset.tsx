import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardSunset({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: 'linear-gradient(165deg, #ff8a5c 0%, #f5567f 45%, #8a4fc4 100%)',
      fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
    }}>
      {/* glowing sun */}
      <div style={{
        position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)',
        width: 150, height: 150, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 40%, #ffe6b8, #ffb27a)',
        boxShadow: '0 0 80px 20px rgba(255,200,140,0.4)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '270px 50px 58px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontSize: 13, letterSpacing: 6, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 52, lineHeight: 0.96, color: '#fff', margin: '8px 0 0', fontWeight: 700, letterSpacing: -1.5 }}>
            {eventTitle}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 19, lineHeight: 1.45, color: 'rgba(255,255,255,0.92)', margin: '14px auto 0', maxWidth: 330, fontWeight: 400 }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#fff', borderRadius: 20, boxShadow: '0 20px 44px -16px rgba(120,40,90,0.5)' }}>
          <QRCode value={joinUrl} size={196} fgColor="#a8417a" bgColor="#ffffff" />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: 3, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
