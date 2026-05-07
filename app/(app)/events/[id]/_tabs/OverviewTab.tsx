"use client";

import { useState } from "react";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { StatRing } from "@/components/app-ui/StatRing";

type OverviewTabProps = Readonly<{
  eventId: string;
  eventTitle: string;
  eventDate: string;
  plan: string;
  accessCode: string;
}>;

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <GoldBar vertical />
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 17, color: 'var(--app-text)' }}>
        {label}
      </span>
    </div>
  );
}

function InfoCard({ eventDate, plan }: { eventDate: string; plan: string }) {
  const formatted = (() => {
    try { return new Date(eventDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return eventDate; }
  })();

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color: 'var(--app-gold)',
          background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
          padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase',
          border: '1.5px solid color-mix(in srgb, var(--app-gold) 27%, transparent)',
          letterSpacing: '0.1em',
        }}>
          {plan}
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'var(--app-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Role</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: 'var(--app-purple)' }}>
            Organizer
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--app-text)' }}>
          <span>📅</span><span>{formatted}</span>
        </div>
        <div style={{ height: 1, background: 'var(--app-border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#D97706', fontWeight: 600 }}>
          <span>⏳</span><span>Uploads close in 30 days</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--app-muted)' }}>
          <span>🗑️</span><span>Event deletes in 180 days</span>
        </div>
      </div>
    </div>
  );
}

function StatsCard() {
  const cameraIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M23 19C23 20.105 22.105 21 21 21H3C1.895 21 1 20.105 1 19V8C1 6.895 1.895 6 3 6H7L9 3H15L17 6H21C22.105 6 23 6.895 23 8V19Z" stroke="var(--app-muted)" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="var(--app-muted)" strokeWidth="2"/>
    </svg>
  );
  const galleryIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="var(--app-muted)" strokeWidth="2"/>
    </svg>
  );
  const guestsIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="7" r="3" stroke="var(--app-muted)" strokeWidth="2"/>
      <path d="M2 20C2 16.686 5.134 14 9 14C12.866 14 16 16.686 16 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 11C18.209 11 20 9.209 20 7" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M19 15C20.657 15.5 22 17.119 22 20" stroke="var(--app-muted)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Statistics" />
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <StatRing value={0} max={2000} color="var(--app-purple)" label="Photos"  sublabel="of 2000" icon={galleryIcon} />
        <StatRing value={0} max={200}  color="var(--app-muted)"  label="Videos"  sublabel="of 200"  icon={cameraIcon} />
        <StatRing value={0} max={250}  color="var(--app-gold)"   label="Guests"  sublabel="of 250"  icon={guestsIcon} />
      </div>
    </div>
  );
}

function AccessCodeCard({ accessCode }: { accessCode: string }) {
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(accessCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Access Code" />
      <div style={{
        background: 'var(--app-bg)', border: '1.5px solid var(--app-border)',
        borderRadius: 12, padding: '14px 20px', textAlign: 'center',
        fontSize: 22, fontWeight: 700, color: 'var(--app-text)',
        letterSpacing: '0.12em', marginBottom: 14,
        fontFamily: 'monospace',
      }}>
        {accessCode}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={copy}
          style={{
            flex: 1, padding: '12px', border: '1.5px solid var(--app-border)', borderRadius: 10,
            background: 'transparent', color: 'var(--app-muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {copied ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          onClick={() => setShowQR(v => !v)}
          style={{
            flex: 1, padding: '12px', border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {showQR ? 'Hide QR' : 'Show QR Invite'}
        </button>
      </div>
      {showQR && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 20, marginTop: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          border: '1.5px solid var(--app-border)',
        }}>
          {/* Placeholder QR pattern */}
          <svg width="120" height="120" viewBox="0 0 120 120" aria-label="QR code placeholder">
            <rect width="120" height="120" fill="white"/>
            {([[ 4, 4], [ 4,84], [84, 4]] as [number,number][]).map(([x,y],i) => (
              <g key={i}>
                <rect x={x} y={y} width="28" height="28" rx="4" fill="#5B2D8E"/>
                <rect x={x+4} y={y+4} width="20" height="20" rx="2" fill="white"/>
                <rect x={x+8} y={y+8} width="12" height="12" rx="1" fill="#5B2D8E"/>
              </g>
            ))}
          </svg>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12, color: 'var(--app-muted)' }}>
            Scan to join the event
          </p>
          <p style={{ fontSize: 11, color: 'var(--app-muted)' }}>
            For the real QR code, use the Share tab.
          </p>
        </div>
      )}
    </div>
  );
}

function FeaturedPhotosCard() {
  return (
    <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
      <SectionHeader label="Featured Photos" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0', gap: 10 }}>
        <span style={{ fontSize: 48, opacity: 0.5 }}>📸</span>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--app-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 240 }}>
          No featured photos yet. Go to the gallery to browse uploads.
        </p>
        <a
          href="?tab=gallery"
          style={{
            marginTop: 4, padding: '9px 18px', border: '1.5px solid var(--app-border)',
            borderRadius: 10, background: 'transparent', color: 'var(--app-muted)',
            fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          Go to Gallery
        </a>
      </div>
    </div>
  );
}

export function OverviewTab({ eventDate, plan, accessCode }: OverviewTabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <InfoCard eventDate={eventDate} plan={plan} />
        <StatsCard />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <AccessCodeCard accessCode={accessCode} />
        <FeaturedPhotosCard />
      </div>
    </div>
  );
}
