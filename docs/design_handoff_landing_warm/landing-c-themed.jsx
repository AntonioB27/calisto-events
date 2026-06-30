// landing-c-themed.jsx — Direction C layout, theme-driven for style exploration.
// Same structure as landing-c (nav · hero+badge · form · how-it-works ·
// phone mockup · feature checklist · pricing comparison w/ Plus highlight ·
// sticky CTA · footer) rendered under 3 visual themes.
const { useState: useStateCT } = React;

const GUESTS_CT = { free:'do 30 gostiju', standard:'do 80 gostiju', plus:'do 200 gostiju', premium:'do 500 gostiju', max:'neograničeno' };

// ── themes ────────────────────────────────────────────────────────
const C_THEMES = {
  warm: {
    pageBg: '#EFE8DD',
    glow: 'radial-gradient(ellipse at center, rgba(123,63,190,0.12) 0%, transparent 70%)',
    text: '#221509', muted: '#9A8570', faint: '#C5B7A3', line: '#E0D6C6',
    surface: '#fff', surfaceBorder: '#E0D6C6', surfaceSoft: '#FBF7F1',
    navBorder: '#E0D6C6',
    badgeBg: '#FBF1DC', badgeBorder: '#E8C878', badgeText: '#3A2A18', starColor: '#C5922A',
    formVariant: 'paper', langTone: 'dark', photoTone: 'warm',
    ctaBg: 'linear-gradient(135deg,#7B3FBE 0%,#5B2D8E 100%)', ctaText: '#fff', ctaShadow: 'rgba(91,45,142,0.30)', ctaLift: true,
    hiFlat: false, hiBg: 'linear-gradient(160deg,#5B2D8E 0%,#45226E 100%)', hiText: '#fff', hiSub: 'rgba(255,255,255,0.72)',
    hiBadgeBg: '#E8C878', hiBadgeText: '#3A2A0A', hiBtnBg: '#fff', hiBtnText: '#5B2D8E',
    stepNum: '#C5922A', stepNumBg: '#FBF1DC', stepNumBorder: '#E8C878',
    checkBg: '#5B2D8E', phoneFrame: '#1d140a',
    stickyBg: 'rgba(255,255,255,0.92)', stickyBorder: '#E0D6C6',
  },
  midnight: {
    pageBg: '#16100A',
    glow: 'radial-gradient(ellipse at center, rgba(197,146,42,0.22) 0%, transparent 70%)',
    text: '#F4ECDD', muted: 'rgba(244,236,221,0.6)', faint: 'rgba(244,236,221,0.34)', line: 'rgba(244,236,221,0.12)',
    surface: 'rgba(255,255,255,0.045)', surfaceBorder: 'rgba(244,236,221,0.13)', surfaceSoft: 'rgba(255,255,255,0.03)',
    navBorder: 'rgba(244,236,221,0.12)',
    badgeBg: 'rgba(232,200,120,0.12)', badgeBorder: 'rgba(232,200,120,0.32)', badgeText: '#E8C878', starColor: '#E8C878',
    formVariant: 'glass', langTone: 'light', photoTone: 'dark',
    ctaBg: 'linear-gradient(135deg,#E8C878 0%,#C5922A 100%)', ctaText: '#241704', ctaShadow: 'rgba(197,146,42,0.34)', ctaLift: true,
    hiFlat: false, hiBg: 'linear-gradient(160deg,#E8C878 0%,#BC8A24 100%)', hiText: '#241704', hiSub: 'rgba(36,23,4,0.72)',
    hiBadgeBg: '#241704', hiBadgeText: '#E8C878', hiBtnBg: '#241704', hiBtnText: '#E8C878',
    stepNum: '#E8C878', stepNumBg: 'rgba(232,200,120,0.12)', stepNumBorder: 'rgba(232,200,120,0.3)',
    checkBg: '#C5922A', phoneFrame: '#000',
    stickyBg: 'rgba(22,16,10,0.92)', stickyBorder: 'rgba(244,236,221,0.12)',
  },
  light: {
    pageBg: '#FBF8F3',
    glow: 'radial-gradient(ellipse at center, rgba(197,146,42,0.08) 0%, transparent 70%)',
    text: '#1E1710', muted: '#8C7E6C', faint: '#BFB29D', line: '#ECE4D8',
    surface: '#fff', surfaceBorder: '#EEE7DB', surfaceSoft: '#F6F1E9',
    navBorder: '#ECE4D8',
    badgeBg: '#fff', badgeBorder: '#ECE4D8', badgeText: '#1E1710', starColor: '#C5922A',
    formVariant: 'paper', langTone: 'dark', photoTone: 'warm',
    ctaBg: '#241B12', ctaText: '#FBF8F3', ctaShadow: 'rgba(40,27,18,0.18)', ctaLift: false,
    hiFlat: true, hiBg: '#fff', hiText: '#1E1710', hiSub: '#8C7E6C',
    hiBadgeBg: '#C5922A', hiBadgeText: '#fff', hiBtnBg: '#241B12', hiBtnText: '#FBF8F3',
    stepNum: '#C5922A', stepNumBg: '#fff', stepNumBorder: '#ECE4D8',
    checkBg: '#241B12', phoneFrame: '#2A2018',
    stickyBg: 'rgba(251,248,243,0.92)', stickyBorder: '#ECE4D8',
  },
};

function ThemedCTA({ children, t, style }) {
  const [hov, setHov] = useStateCT(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', border: 'none', borderRadius: 14, padding: '15px 24px',
        background: t.ctaBg, color: t.ctaText, fontFamily: SANS, fontSize: 14.5, fontWeight: 700,
        letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer',
        boxShadow: hov ? `0 10px 30px ${t.ctaShadow}` : `0 5px 16px ${t.ctaShadow}`,
        transform: (hov && t.ctaLift) ? 'translateY(-1px)' : 'none', transition: 'all 0.2s',
        ...style,
      }}>{children}</button>
  );
}

function ThemedPhone({ t }) {
  return (
    <div style={{ width: 188, margin: '0 auto', borderRadius: 30, background: t.phoneFrame, padding: 8, boxShadow: '0 28px 50px -22px rgba(20,12,4,0.5)' }}>
      <div style={{ borderRadius: 23, overflow: 'hidden', background: t.surfaceSoft, border: `1px solid ${t.line}` }}>
        <div style={{ height: 30, background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${t.line}` }}>
          <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 12, color: t.text }}>Antonio i Matea</span>
        </div>
        <div style={{ padding: 7, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {Array.from({ length: 6 }).map((_, i) => <Photo key={i} label="" h={i % 3 === 0 ? 64 : 50} radius={8} tone={t.photoTone} />)}
        </div>
      </div>
    </div>
  );
}

function LandingCThemed({ theme = 'warm' }) {
  const t = C_THEMES[theme];

  return (
    <div style={{ width: '100%', background: t.pageBg, fontFamily: SANS, color: t.text, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: -100, right: -80, width: 360, height: 300, background: t.glow, pointerEvents: 'none' }} />

      {/* nav */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1px solid ${t.navBorder}` }}>
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: t.text }}>Calisto.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LangSwitcher tone={t.langTone} />
          <a href="#" style={{ fontSize: 13, fontWeight: 600, color: t.text, textDecoration: 'none' }}>Prijava</a>
        </div>
      </div>

      {/* hero */}
      <div style={{ position: 'relative', padding: '32px 26px 0' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, borderRadius: 30, padding: '6px 13px', marginBottom: 16 }}>
          <span style={{ color: t.starColor, fontSize: 12 }}>★★★★★</span>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: t.badgeText }}>4.9 · 12.000+ događaja</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 36, lineHeight: 1.07, margin: 0, color: t.text }}>
          Gosti skeniraju.<br/>Vi skupljate uspomene.
        </h1>
        <p style={{ fontSize: 14.5, color: t.muted, lineHeight: 1.55, margin: '14px 0 0', maxWidth: 340 }}>
          Jedan QR kod prikuplja sve fotografije i videe s vaše proslave — uživo, bez aplikacije, u punoj kvaliteti.
        </p>
      </div>

      {/* form card */}
      <div style={{ position: 'relative', padding: '24px 22px 0' }}>
        <div style={{ background: t.surface, borderRadius: 20, padding: '22px 20px 24px', border: `1px solid ${t.surfaceBorder}`, boxShadow: theme === 'midnight' ? 'none' : '0 18px 40px -22px rgba(80,55,20,0.22)' }}>
          <CreateForm variant={t.formVariant} compact />
          <div style={{ marginTop: 17 }}>
            <ThemedCTA t={t}>Stvori događaj besplatno →</ThemedCTA>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: t.muted, marginTop: 11 }}>Bez kreditne kartice · spremno odmah</p>
        </div>
      </div>

      {/* how it works — 3 steps */}
      <div style={{ position: 'relative', padding: '38px 26px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <Label color={t.muted} style={{ display: 'inline-block' }}>Kako radi</Label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['1', 'Stvorite događaj', 'Naziv, datum — i gotovi ste.'],
            ['2', 'Gosti skeniraju QR', 'Bez aplikacije, bez registracije.'],
            ['3', 'Uspomene stižu uživo', 'Sve na jednom mjestu, u punoj kvaliteti.'],
          ].map(([n, ti, d]) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '13px 15px' }}>
              <div style={{ width: 30, height: 30, flexShrink: 0, borderRadius: '50%', background: t.stepNumBg, border: `1px solid ${t.stepNumBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, color: t.stepNum, fontSize: 15 }}>{n}</div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: t.text }}>{ti}</div>
                <div style={{ fontSize: 12.5, color: t.muted, marginTop: 1 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* phone mockup */}
      <div style={{ position: 'relative', padding: '40px 26px 0', textAlign: 'center' }}>
        <Label color={t.muted} style={{ display: 'inline-block', marginBottom: 14 }}>Album uživo</Label>
        <ThemedPhone t={t} />
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: t.muted, lineHeight: 1.5, margin: '18px auto 0', maxWidth: 290 }}>
          Svaka skenirana fotografija pojavljuje se u zajedničkom albumu u trenutku.
        </p>
      </div>

      {/* feature checklist */}
      <div style={{ position: 'relative', padding: '36px 26px 0' }}>
        <div style={{ background: t.surfaceSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 13 }}>
          {['Bez aplikacije — gosti samo skeniraju', 'Fotografije i videi u punoj kvaliteti', 'Preuzmite cijeli album jednim klikom', 'Privatno i samo za vaše goste'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.checkBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke={theme === 'midnight' ? '#241704' : '#fff'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7"/></svg>
              </div>
              <span style={{ fontSize: 13.5, color: t.text }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* pricing comparison */}
      <div style={{ position: 'relative', padding: '42px 26px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Label color={t.muted} style={{ display: 'inline-block', marginBottom: 8 }}>Planovi · po događaju</Label>
          <h2 style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 27, color: t.text }}>Odaberite veličinu proslave</h2>
        </div>

        {/* recommended highlight (Plus) */}
        {(() => {
          const p = PLANS.find(x => x.id === 'plus');
          return (
            <div style={{ position: 'relative', borderRadius: 20, padding: '22px 22px 24px', background: t.hiBg, color: t.hiText,
              border: t.hiFlat ? '1.5px solid #C5922A' : 'none',
              boxShadow: t.hiFlat ? '0 14px 36px -20px rgba(80,55,20,0.25)' : '0 20px 44px -20px rgba(91,45,142,0.5)', marginBottom: 12 }}>
              <div style={{ position: 'absolute', top: 16, right: 18, background: t.hiBadgeBg, color: t.hiBadgeText, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: 20 }}>Najpopularnije</div>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: t.hiText }}>{p.name}</div>
              <div style={{ fontSize: 13, color: t.hiSub, marginTop: 2 }}>{GUESTS_CT.plus}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '14px 0 4px' }}>
                <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 42, lineHeight: 1, color: t.hiText }}>{p.price}</span>
                <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 10, color: t.hiSub, letterSpacing: '0.08em' }}>/ DOGAĐAJ</span>
              </div>
              <p style={{ fontSize: 13, color: t.hiSub, margin: '6px 0 18px', lineHeight: 1.5 }}>{p.desc}</p>
              <button style={{ width: '100%', border: 'none', borderRadius: 13, padding: '14px', background: t.hiBtnBg, color: t.hiBtnText, fontFamily: SANS, fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer' }}>Odaberi Plus →</button>
            </div>
          );
        })()}

        {/* compact comparison rows */}
        <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 18, overflow: 'hidden' }}>
          {PLANS.filter(p => p.id !== 'plus').map((p, i, arr) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 18px', borderBottom: i < arr.length - 1 ? `1px solid ${t.line}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: p.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <PlanIcon name={p.icon} color={p.ink} size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: t.text }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: t.muted }}>{GUESTS_CT[p.id]}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {p.was && <div style={{ fontSize: 11, color: t.faint, textDecoration: 'line-through' }}>{p.was}</div>}
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: t.text }}>{p.price}</div>
              </div>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={t.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M5 3l5 4.5L5 12"/></svg>
            </div>
          ))}
        </div>
      </div>

      {/* footer + spacer for sticky bar */}
      <div style={{ padding: '34px 26px 0' }}>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 11.5, color: t.faint, lineHeight: 1.6, textAlign: 'center' }}>{FAIR_USE}</p>
      </div>
      <div style={{ height: 92 }} />

      {/* sticky mobile CTA (pinned to bottom of frame) */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 18px calc(12px + env(safe-area-inset-bottom))',
        background: t.stickyBg, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderTop: `1px solid ${t.stickyBorder}`, boxShadow: '0 -6px 20px -8px rgba(20,12,4,0.18)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Spremno za 30 sekundi</div>
          <div style={{ fontSize: 11, color: t.muted }}>Free plan · bez kartice</div>
        </div>
        <ThemedCTA t={t} style={{ width: 'auto', flexShrink: 0, padding: '13px 20px' }}>Stvori →</ThemedCTA>
      </div>
    </div>
  );
}

Object.assign(window, { LandingCThemed, C_THEMES });
