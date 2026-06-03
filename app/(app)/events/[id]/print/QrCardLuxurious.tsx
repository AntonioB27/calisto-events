import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

const CORNERS: Array<['top' | 'bottom', 'left' | 'right']> = [
  ['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right'],
];

export function QrCardLuxurious({ eventTitle, accessCode, joinUrl, copy }: Props) {
  const gold = 'linear-gradient(135deg,#e7c879 0%,#bd9136 50%,#f0d792 100%)';
  return (
    <div className="qr-card-dark" style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'radial-gradient(120% 120% at 50% 0%, #241c14 0%, #17110b 60%, #100b07 100%)',
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 22, border: '2px solid #9a7322', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 28, border: '1px solid rgba(231,200,121,0.5)', pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '66px 50px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 16, letterSpacing: 9, margin: 0, background: gold, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 500 }}>
            C A L I S T O
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, margin: '14px 0 10px' }}>
            <span style={{ width: 44, height: 1, background: 'linear-gradient(90deg,transparent,#bd9136)', display: 'block' }} />
            <span style={{ color: '#bd9136', fontSize: 16 }}>✦</span>
            <span style={{ width: 44, height: 1, background: 'linear-gradient(270deg,transparent,#bd9136)', display: 'block' }} />
          </div>
          <h1 style={{ fontFamily: "'Bodoni Moda', 'Cormorant Garamond', serif", fontSize: 60, lineHeight: 0.96, color: '#f3e9d2', margin: 0, fontWeight: 500 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: '#c9bda3', margin: '18px auto 0', maxWidth: 360, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 22, background: '#fbf7ee', position: 'relative', boxShadow: '0 20px 50px -16px rgba(0,0,0,0.7)' }}>
          {CORNERS.map(([v, h], i) => (
            <span key={i} style={{
              position: 'absolute',
              [v]: -8, [h]: -8,
              width: 22, height: 22,
              borderTop: v === 'top' ? '2px solid #bd9136' : 'none',
              borderBottom: v === 'bottom' ? '2px solid #bd9136' : 'none',
              borderLeft: h === 'left' ? '2px solid #bd9136' : 'none',
              borderRight: h === 'right' ? '2px solid #bd9136' : 'none',
              display: 'block',
            }} />
          ))}
          <QRCode value={joinUrl} size={202} fgColor="#1a140d" bgColor="#fbf7ee" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 14, letterSpacing: 5, color: '#8c7a4f', margin: 0 }}>
          JOIN CODE — {accessCode}
        </p>
      </div>
    </div>
  );
}
