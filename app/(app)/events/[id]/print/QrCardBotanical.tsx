import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

function LeafBranch({ style, color }: { style: React.CSSProperties; color: string }) {
  return (
    <svg viewBox="0 0 260 120" style={style} fill="none" stroke={color}>
      <path d="M4 60 C80 40 170 40 256 58" strokeWidth="1.6" />
      {[...Array(9)].map((_, i) => {
        const t = i / 8;
        const x = 20 + t * 220;
        const y = 58 - Math.sin(t * Math.PI) * 16;
        const s = i % 2 === 0 ? 1 : -1;
        return <ellipse key={i} cx={x} cy={y - s * 14} rx="13" ry="6" transform={`rotate(${s * 32} ${x} ${y - s * 14})`} strokeWidth="1.3" />;
      })}
    </svg>
  );
}

export function QrCardBotanical({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #eaf0e4 0%, #dfe8d6 55%, #d6e1cc 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      overflow: 'hidden',
    }}>
      <LeafBranch style={{ position: 'absolute', top: 18, left: -50, width: 300, height: 130, opacity: 0.5 }} color="#6d8a63" />
      <LeafBranch style={{ position: 'absolute', bottom: 10, right: -50, width: 300, height: 130, opacity: 0.4, transform: 'rotate(180deg)' }} color="#7d9a72" />
      <div style={{
        position: 'absolute', inset: 0, padding: '64px 52px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 15, letterSpacing: 6, color: '#7a9170', margin: 0, textTransform: 'uppercase', fontWeight: 500 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 58, lineHeight: 1, color: '#37502f', margin: '6px 0 0', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 24, lineHeight: 1.45, color: '#516249', margin: '14px auto 0', maxWidth: 360, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#ffffff', borderRadius: 14, border: '1px solid #cdd9c2', boxShadow: '0 16px 34px -20px rgba(79,107,74,0.55)' }}>
          <QRCode value={joinUrl} size={200} fgColor="#3f5a3a" bgColor="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ width: 30, height: 1, background: '#9ab18f', display: 'block' }} />
            <span style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 15, letterSpacing: 4, color: '#6d8a63', textTransform: 'uppercase' }}>
              Calisto · calisto-events.com
            </span>
            <span style={{ width: 30, height: 1, background: '#9ab18f', display: 'block' }} />
          </div>
          <div style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 12, letterSpacing: 4, color: '#7a9170', marginTop: 8 }}>
            CODE · {accessCode}
          </div>
        </div>
      </div>
    </div>
  );
}
