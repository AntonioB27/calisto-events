import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

const DOTS: Array<[string, number, string, string]> = [
  ['#6B2FA0', 54, '14%', '8%'], ['#FF7A59', 26, '8%', '78%'], ['#2BB3A3', 20, '46%', '4%'],
  ['#F2B705', 40, '60%', '90%'], ['#FF7A59', 16, '88%', '20%'], ['#6B2FA0', 22, '92%', '70%'],
  ['#2BB3A3', 32, '30%', '92%'], ['#F2B705', 15, '78%', '6%'],
];

export function QrCardPlayful({ eventTitle, accessCode, joinUrl, copy }: Props) {
  const hlParts = (copy.headline ?? "Snap it. Share it!").split(". ");
  const hl1 = hlParts[0] + ".";
  const hl2 = hlParts.slice(1).join(". ");
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#fdf7ef', fontFamily: "'DM Sans', sans-serif",
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,#7a3bb0,#5b2d8e)', top: -150, left: -90 }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: '#FF7A59', bottom: -110, right: -50, opacity: 0.9 }} />
      {DOTS.map((d, i) => (
        <span key={i} style={{
          position: 'absolute', width: d[1], height: d[1],
          borderRadius: i % 3 === 0 ? '30%' : '50%',
          background: d[0], top: d[2], left: d[3], opacity: 0.85,
          transform: `rotate(${i * 35}deg)`, display: 'block',
        }} />
      ))}
      <div style={{
        position: 'absolute', inset: 0, padding: '60px 50px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', zIndex: 2,
      }}>
        <div>
          <span style={{ display: 'inline-block', background: '#6B2FA0', color: '#fff', fontSize: 14, letterSpacing: 2, fontWeight: 700, padding: '7px 16px', borderRadius: 30, textTransform: 'uppercase' }}>
            {copy.badge}
          </span>
          <h1 style={{ fontFamily: "'Fredoka', 'DM Sans', sans-serif", fontSize: 62, lineHeight: 0.96, color: '#3a1a5c', margin: '16px 0 0', fontWeight: 600 }}>
            {hl1}<br /><span style={{ color: '#FF7A59' }}>{hl2}</span>
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.4, color: '#5a4a66', margin: '14px auto 0', maxWidth: 340, fontWeight: 500 }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 20, background: '#fff', borderRadius: 26, transform: 'rotate(-4deg)', boxShadow: '0 18px 36px -14px rgba(107,47,160,0.45)', border: '3px solid #fff' }}>
          <QRCode value={joinUrl} size={198} fgColor="#3a1a5c" bgColor="#ffffff" />
        </div>
        <div>
          <span style={{ display: 'inline-block', background: '#F2B705', color: '#3a1a5c', fontSize: 14, fontWeight: 700, letterSpacing: 2, padding: '7px 16px', borderRadius: 30, transform: 'rotate(2deg)' }}>
            CODE · {accessCode}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 14 }}>
            <span style={{ fontFamily: "'Fredoka', 'DM Sans', sans-serif", fontSize: 21, color: '#6B2FA0', fontWeight: 600 }}>Calisto</span>
            <span style={{ fontSize: 15, color: '#9a8aa6', fontWeight: 600 }}>calisto-events.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
