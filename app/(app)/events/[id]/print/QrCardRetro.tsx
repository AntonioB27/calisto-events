import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

const BURST_COLORS = ['#cf7e3c', '#a8843c', '#7c8a3f'];

export function QrCardRetro({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#e9d29a', fontFamily: "'Fredoka', 'DM Sans', sans-serif",
    }}>
      <svg viewBox="0 0 560 794" width="560" height="794" style={{ position: 'absolute', inset: 0 }}>
        {[...Array(24)].map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const col = BURST_COLORS[i % 3];
          return (
            <path key={i}
              d={`M280 300 L${280 + Math.cos(a) * 700} ${300 + Math.sin(a) * 700} L${280 + Math.cos(a + 0.13) * 700} ${300 + Math.sin(a + 0.13) * 700} Z`}
              fill={col} opacity="0.22" />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, padding: '66px 54px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <span style={{
            display: 'inline-block', background: '#7c8a3f', color: '#f3e6c6',
            fontSize: 13, fontWeight: 600, letterSpacing: 3, padding: '6px 16px',
            borderRadius: 30, textTransform: 'uppercase',
          }}>
            {copy.badge}
          </span>
          <h1 style={{ fontSize: 62, lineHeight: 0.92, color: '#9c4a1f', margin: '14px 0 0', fontWeight: 600 }}>
            {eventTitle}
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 19, lineHeight: 1.4, color: '#7a5326', margin: '12px auto 0', maxWidth: 320, fontWeight: 500 }}>
            {copy.body}
          </p>
        </div>
        <div style={{
          padding: 18, background: '#fbf4e2', borderRadius: 20,
          border: '4px solid #cf7e3c', boxShadow: '0 14px 30px -14px rgba(120,70,20,0.5)',
        }}>
          <QRCode value={joinUrl} size={186} fgColor="#9c4a1f" bgColor="#fbf4e2" />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, letterSpacing: 3, color: '#8a5a28', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
