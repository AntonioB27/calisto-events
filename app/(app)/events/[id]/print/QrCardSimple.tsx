import QRCode from "react-qr-code";
import type { QrCardCopy } from "./QrThemedPrintSheet";

type Props = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function QrCardSimple({ accessCode, joinUrl, copy }: Props) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#ffffff', fontFamily: "'Space Grotesk', 'DM Sans', sans-serif",
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 22, border: '1px solid #ececec', pointerEvents: 'none' }} />
      <div style={{
        position: 'absolute', inset: 0, padding: '70px 56px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 22 }}>
            <span style={{ width: 24, height: 2, background: '#6B2FA0', display: 'block' }} />
            <span style={{ fontSize: 13, letterSpacing: 4, color: '#8a8a8a', fontWeight: 500 }}>{copy.tagline}</span>
            <span style={{ width: 24, height: 2, background: '#6B2FA0', display: 'block' }} />
          </div>
          <h1 style={{ fontSize: 54, lineHeight: 0.98, fontWeight: 600, color: '#16110c', letterSpacing: -1.5, margin: 0 }}>
            {copy.headline}
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.45, color: '#6c6c6c', margin: '20px auto 0', maxWidth: 360, fontWeight: 300 }}>
            {copy.body}
          </p>
        </div>
        <div style={{ padding: 22, background: '#fafafa', border: '1px solid #ededed', borderRadius: 18 }}>
          <QRCode value={joinUrl} size={206} fgColor="#16110c" bgColor="#fafafa" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 600, color: '#16110c', letterSpacing: 0.5 }}>Calisto</span>
            <span style={{ width: 4, height: 4, borderRadius: 4, background: '#cfcfcf', display: 'inline-block' }} />
            <span style={{ fontSize: 16, color: '#9a9a9a' }}>calisto-events.com</span>
          </div>
          <div style={{ fontSize: 12, letterSpacing: 3, color: '#b8b8b8', fontWeight: 500, marginTop: 10 }}>
            CODE · {accessCode}
          </div>
        </div>
      </div>
    </div>
  );
}
