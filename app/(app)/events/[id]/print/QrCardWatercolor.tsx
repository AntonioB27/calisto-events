import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

function Blob({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: s, height: s,
      borderRadius: '50%', background: c, filter: 'blur(38px)', opacity: 0.55,
    }} />
  );
}

export function QrCardWatercolor({ eventTitle, accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#fdfbf7', fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>
      <Blob x={-60} y={-40} s={260} c="#f3c6d3" />
      <Blob x={360} y={20} s={240} c="#cfe0d0" />
      <Blob x={380} y={560} s={260} c="#d8cdef" />
      <Blob x={-50} y={580} s={240} c="#f6dcc0" />
      <div style={{ position: 'absolute', inset: 28, border: '1px solid rgba(150,130,140,0.25)', borderRadius: 4, pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '70px 54px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center',
      }}>
        <div>
          <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 6, color: '#a98a96', textTransform: 'uppercase', margin: 0 }}>
            {copy.tagline}
          </p>
          <h1 style={{ fontSize: 64, lineHeight: 0.96, color: '#6a5560', margin: '8px 0 0', fontWeight: 500 }}>
            {eventTitle}
          </h1>
          <p style={{ fontSize: 23, lineHeight: 1.45, color: '#7d6b73', margin: '14px auto 0', maxWidth: 350, fontStyle: 'italic' }}>
            {copy.body}
          </p>
        </div>
        <div style={{
          padding: 20, background: 'rgba(255,255,255,0.82)', borderRadius: 14,
          boxShadow: '0 16px 34px -18px rgba(120,90,110,0.4)', backdropFilter: 'blur(2px)',
        }}>
          <QRCode value={joinUrl} size={196} fgColor="#6a5560" bgColor="rgba(255,255,255,0.82)" />
        </div>
        <p style={{ fontFamily: "'Jost', 'DM Sans', sans-serif", fontSize: 13, letterSpacing: 4, color: '#a98a96', textTransform: 'uppercase', margin: 0 }}>
          Calisto · {accessCode} · calisto-events.com
        </p>
      </div>
    </div>
  );
}
