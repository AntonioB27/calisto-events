// landing-shared.jsx — Calisto ad-landing redesign: brand tokens + shared atoms
// Consumed by landing-a/b/c.jsx. Exposes everything on window.
const { useState } = React;

// ── brand tokens ──────────────────────────────────────────────────
const C = {
  cream:     '#EFE8DD',
  creamDeep: '#E6DBCC',
  paper:     '#FBF7F1',
  text:      '#221509',
  ink:       '#3A2A18',
  muted:     '#9A8570',
  faint:     '#C5B7A3',
  line:      '#E0D6C6',
  gold:      '#C5922A',
  goldSoft:  '#E8C878',
  goldTint:  '#FBF1DC',
  purple:    '#5B2D8E',
  purpleHi:  '#7B3FBE',
};

const MASCOT = {
  default: 'https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot.png&w=640&q=75',
  key:     'https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot%2Faurora_key.png&w=384&q=75',
  gift:    'https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot%2Faurora_gift.png&w=384&q=75',
  camera:  'https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot%2Faurora_camera.png&w=384&q=75',
};

const SERIF = "'Playfair Display', serif";
const SANS  = "'DM Sans', sans-serif";

// ── pricing tiers (matches live product) ──────────────────────────
const PLANS = [
  { id:'free',     name:'Free',     price:'0€',  was:null,  tint:'#EAF1E6', chip:'#E2EDDB', ink:'#4E7A4A', desc:'Za male rođendane i obiteljska okupljanja', icon:'leaf' },
  { id:'standard', name:'Standard', price:'15€', was:null,  tint:'#E9EEF8', chip:'#E0E8F6', ink:'#3E5FA6', desc:'Za rođendane i manja vjenčanja',           icon:'star' },
  { id:'plus',     name:'Plus',     price:'35€', was:null,  tint:'#F0EAF4', chip:'#E9E0F1', ink:'#7A4FA6', desc:'Za srednje proslave i duže liste gostiju',  icon:'layers' },
  { id:'premium',  name:'Premium',  price:'65€', was:'70€', tint:'#FBF0DC', chip:'#F5E6C4', ink:'#B07E25', desc:'Za velika vjenčanja i svečane događaje',     icon:'diamond' },
  { id:'max',      name:'Max',      price:'90€', was:'100€',tint:'#F8E7EE', chip:'#F3DBE5', ink:'#B0517A', desc:'Za festivale, višednevne evente i neograničeni obuhvat', icon:'spark' },
];

const FAIR_USE = 'Primjenjuje se fair-use politika: postoji razuman maksimalan limit veličine videodatoteke radi sprječavanja zloupotrebe.';

// ── simple geometric icons (kept minimal on purpose) ──────────────
function PlanIcon({ name, color, size = 18 }) {
  const s = { width: size, height: size, display: 'block' };
  switch (name) {
    case 'leaf':   return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4C9 4 4 9 4 18c0 1 .5 2 .5 2S14 19 18 13c2-3 2-9 2-9Z"/><path d="M7 17c3-4 7-7 11-9"/></svg>;
    case 'star':   return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8-4.3-4.1 5.9-.9z"/></svg>;
    case 'layers': return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>;
    case 'diamond':return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round"><path d="M12 3l8 8-8 10L4 11z"/></svg>;
    case 'spark':  return <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M6 6l12 12M18 6L6 18"/></svg>;
    default: return null;
  }
}

// ── atoms ─────────────────────────────────────────────────────────
function GoldBar({ w = 30, color = C.gold, style }) {
  return <div style={{ width: w, height: 3, borderRadius: 2, background: color, ...style }} />;
}

function Label({ children, color = C.muted, style }) {
  return <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}

function LangSwitcher({ tone = 'dark' }) {
  const [lang, setLang] = useState('HR');
  const tc = tone === 'dark' ? 'rgba(34,21,9,0.42)' : 'rgba(255,255,255,0.6)';
  const activeBg = tone === 'dark' ? C.gold : 'rgba(255,255,255,0.95)';
  const activeFg = tone === 'dark' ? '#1a0f00' : C.text;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {['HR','EN','DE'].map(l => (
        <button key={l} onClick={() => setLang(l)} style={{
          padding: '4px 9px', border: 'none', borderRadius: 7,
          background: lang === l ? activeBg : 'transparent',
          color: lang === l ? activeFg : tc,
          fontSize: 10, fontWeight: 700, cursor: 'pointer',
          fontFamily: SANS, letterSpacing: '0.06em', transition: 'all 0.18s',
        }}>{l}</button>
      ))}
    </div>
  );
}

// Striped photo placeholder with mono caption (per house style)
function Photo({ label, h = 160, radius = 16, style, tone = 'warm' }) {
  const stripe = tone === 'warm'
    ? 'repeating-linear-gradient(135deg, #E7DCCB 0 11px, #EFE6D6 11px 22px)'
    : 'repeating-linear-gradient(135deg, rgba(255,255,255,0.07) 0 11px, rgba(255,255,255,0.12) 11px 22px)';
  const cap = tone === 'warm' ? C.faint : 'rgba(255,255,255,0.6)';
  return (
    <div style={{
      height: h, borderRadius: radius, background: stripe,
      border: tone === 'warm' ? `1px solid ${C.line}` : '1px solid rgba(255,255,255,0.14)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', ...style,
    }}>
      <span style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 10.5, letterSpacing: '0.08em', color: cap, textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// ── create-event form (minimal: name, date, emoji) ────────────────
const EMOJIS = ['🎉','💍','🎂','🎓','🏖️','🎊'];

function CreateForm({ variant = 'paper', accent = C.purple, compact = false }) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎉');
  const dark = variant === 'glass';
  const fieldBg = dark ? 'rgba(255,255,255,0.08)' : C.paper;
  const fieldBd = dark ? 'rgba(255,255,255,0.16)' : C.line;
  const fieldTx = dark ? '#fff' : C.text;
  const phColor = dark ? 'rgba(255,255,255,0.45)' : C.faint;
  const lblColor = dark ? 'rgba(255,255,255,0.55)' : C.muted;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 11 : 13, fontFamily: SANS }}>
      <div>
        <Label color={lblColor} style={{ marginBottom: 7 }}>Naziv događaja</Label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="npr. Antonio i Matea"
          style={{
            width: '100%', padding: '13px 15px', background: fieldBg,
            border: `1.5px solid ${fieldBd}`, borderRadius: 13, fontSize: 15.5,
            color: fieldTx, outline: 'none', fontFamily: SANS,
          }} />
      </div>
      <div>
        <Label color={lblColor} style={{ marginBottom: 7 }}>Datum događaja</Label>
        <div style={{
          width: '100%', padding: '13px 15px', background: fieldBg,
          border: `1.5px solid ${fieldBd}`, borderRadius: 13, fontSize: 15.5,
          color: fieldTx, fontFamily: SANS, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>27.04.2026.</span>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={phColor} strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 2.5v4M16 2.5v4"/></svg>
        </div>
      </div>
      <div>
        <Label color={lblColor} style={{ marginBottom: 7 }}>Emoji</Label>
        <div style={{ display: 'flex', gap: 7 }}>
          {EMOJIS.map(e => {
            const sel = emoji === e;
            return (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 42, height: 42, flex: '1 1 0',
                background: sel ? (dark ? 'rgba(255,255,255,0.16)' : C.goldTint) : fieldBg,
                border: `1.5px solid ${sel ? C.gold : fieldBd}`,
                borderRadius: 11, fontSize: 19, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
              }}>{e}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Big primary CTA button (purple-gradient house button)
function CTA({ children, full = true, accent = 'purple', style, onClick }) {
  const [hov, setHov] = useState(false);
  const bg = accent === 'gold'
    ? `linear-gradient(135deg, ${C.gold} 0%, #A8761B 100%)`
    : `linear-gradient(135deg, ${C.purpleHi} 0%, ${C.purple} 100%)`;
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: full ? '100%' : 'auto', border: 'none', borderRadius: 15,
        padding: '16px 26px', background: bg, color: '#fff',
        fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: '0.07em',
        textTransform: 'uppercase', cursor: 'pointer',
        boxShadow: hov ? `0 10px 30px ${accent === 'gold' ? 'rgba(197,146,42,0.4)' : 'rgba(91,45,142,0.4)'}` : `0 5px 18px ${accent === 'gold' ? 'rgba(197,146,42,0.28)' : 'rgba(91,45,142,0.26)'}`,
        transform: hov ? 'translateY(-1px)' : 'none', transition: 'all 0.2s',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        ...style,
      }}>{children}</button>
  );
}

// Small trust stat
function Stat({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: '0.08em', color: C.muted, marginTop: 5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

Object.assign(window, { C, MASCOT, SERIF, SANS, PLANS, FAIR_USE, PlanIcon, GoldBar, Label, LangSwitcher, Photo, CreateForm, CTA, Stat });
