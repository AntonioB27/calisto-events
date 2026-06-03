import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardNoir({ accessCode, joinUrl, copy }: Props) {
  const words = (copy.headline ?? "SHARE THE NIGHT").split(" ");
  const outlinedWord = words.pop() ?? "";
  const headlineLines = words;
  return (
    <div className="qr-card-dark" style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#111111', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
    }}>
      <div style={{
        position: 'absolute', inset: 0, padding: '60px 48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, letterSpacing: 4, color: '#777', fontWeight: 500 }}>CALISTO</span>
            <span style={{ fontSize: 13, letterSpacing: 4, color: '#777', fontWeight: 500 }}>calisto-events.com</span>
          </div>
          <div style={{ height: 2, background: '#fff', margin: '14px 0 0' }} />
        </div>
        <div>
          <p style={{ fontSize: 16, letterSpacing: 3, color: '#9a9a9a', margin: '0 0 8px', fontWeight: 500 }}>
            {copy.noirSub}
          </p>
          <h1 style={{ fontSize: 88, lineHeight: 0.86, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: -3 }}>
            {headlineLines.join('\n').split('\n').map((w, i) => <span key={i}>{w}<br /></span>)}
            <span style={{ WebkitTextStroke: '2px #fff', color: 'transparent' }}>{outlinedWord}</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18 }}>
          <div style={{ maxWidth: 200 }}>
            <p style={{ fontSize: 17, lineHeight: 1.4, color: '#bdbdbd', margin: 0, fontWeight: 300 }}>
              {copy.body}
            </p>
            <p style={{ fontSize: 13, letterSpacing: 3, color: '#fff', margin: '16px 0 0', fontWeight: 600 }}>
              CODE — {accessCode}
            </p>
          </div>
          <div style={{ padding: 14, background: '#fff', flexShrink: 0 }}>
            <QRCode value={joinUrl} size={168} fgColor="#111111" bgColor="#ffffff" />
          </div>
        </div>
      </div>
    </div>
  );
}
