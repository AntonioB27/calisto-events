import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

function DecoFan({ style, color }: { style: React.CSSProperties; color: string }) {
  return (
    <svg viewBox="0 0 200 200" style={style} fill="none" stroke={color}>
      {[...Array(7)].map((_, i) => (
        <path
          key={i}
          d={`M100 200 L100 ${30 + i * 24} A${70 - i * 8} ${70 - i * 8} 0 0 1 ${100 + (70 - i * 8)} ${200}`}
          strokeWidth="1.2"
        />
      ))}
    </svg>
  );
}

export function QrCardArtDeco({ eventTitle, accessCode, joinUrl, copy }: Props) {
  const gold = '#d8b35f';
  return (
    <div className="qr-card-dark" style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'radial-gradient(130% 110% at 50% 0%, #11473c 0%, #0c352c 55%, #07241d 100%)',
      fontFamily: "'Marcellus', 'Cormorant Garamond', serif",
      overflow: 'hidden',
    }}>
      <DecoFan style={{ position: 'absolute', left: -34, bottom: -38, width: 200, height: 200, opacity: 0.35 }} color={gold} />
      <DecoFan style={{ position: 'absolute', right: -34, bottom: -38, width: 200, height: 200, opacity: 0.35, transform: 'scaleX(-1)' }} color={gold} />
      <div style={{ position: 'absolute', inset: 22, border: `1.5px solid ${gold}`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 31, border: `0.5px solid rgba(216,179,95,0.5)`, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '60px 46px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontSize: 14, letterSpacing: 8, color: gold, margin: 0 }}>★ CALISTO ★</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, margin: '12px 0' }}>
            <span style={{ width: 36, height: 1, background: gold, display: 'block' }} />
            <span style={{ width: 8, height: 8, background: gold, transform: 'rotate(45deg)', display: 'block' }} />
            <span style={{ width: 36, height: 1, background: gold, display: 'block' }} />
          </div>
          <h1 style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontSize: 42, lineHeight: 1.08, color: '#f6edd4', margin: 0, fontWeight: 600, letterSpacing: 1 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 22, lineHeight: 1.45, color: '#bcd2c5', margin: '16px auto 0', maxWidth: 350, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ position: 'relative', padding: 12 }}>
          <div style={{ position: 'absolute', inset: 0, border: `2px solid ${gold}` }} />
          <div style={{ padding: 18, background: '#f7f1e1' }}>
            <QRCode value={joinUrl} size={196} fgColor="#0c352c" bgColor="#f7f1e1" />
          </div>
        </div>
        <p style={{ fontFamily: "'Cinzel', 'Cormorant Garamond', serif", fontSize: 13, letterSpacing: 5, color: gold, margin: 0 }}>
          JOIN CODE · {accessCode}
        </p>
      </div>
    </div>
  );
}
