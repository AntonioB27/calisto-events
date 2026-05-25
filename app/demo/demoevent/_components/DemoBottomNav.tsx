"use client";

import Link from "next/link";
import { Home, Users, Images } from "lucide-react";
import { DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import type { DemoTabId } from "../demo-role";

const GOLD_DK = '#946C18';
const INK_SUB = '#5A4A36';
const INK     = '#221509';
const MUTED   = '#9A8570';
const PAPER   = '#F3ECDF';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const ICON_MAP = {
  overview: Home,
  guests:   Users,
  gallery:  Images,
} as const;

const guestCount = DEMO_GUESTS.length;
const mediaCount = DEMO_PHOTOS.length;

type TabDef = { id: DemoTabId; label: string; count: number | null };
const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', count: null },
  { id: 'guests',   label: 'Guests',   count: guestCount },
  { id: 'gallery',  label: 'Gallery',  count: mediaCount },
];

type Props = { selectedTab: DemoTabId };

export function DemoBottomNav({ selectedTab }: Props) {
  return (
    <nav
      aria-label="Demo event navigation"
      style={{
        position: 'fixed',
        left: 18,
        right: 18,
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(250,245,235,0.88)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        borderRadius: 22,
        padding: 5,
        border: '1px solid rgba(255,255,255,0.7)',
        boxShadow: '0 12px 30px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        display: 'flex',
        gap: 4,
        zIndex: 100,
      }}
    >
      {TABS.map(({ id, label, count }) => {
        const active = id === selectedTab;
        const href = `/demo/demoevent?tab=${id}&role=organizer`;
        const Icon = ICON_MAP[id as keyof typeof ICON_MAP];
        return (
          <Link
            key={id}
            href={href}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: active ? 1.4 : 1,
              background: active ? PAPER : 'transparent',
              borderRadius: 18,
              padding: '9px 6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              boxShadow: active
                ? '0 2px 6px rgba(40,25,15,0.12), inset 0 0 0 1px rgba(197,146,42,0.3)'
                : 'none',
              transition: 'flex 200ms ease',
              textDecoration: 'none',
              outline: 'none',
            }}
          >
            <Icon
              size={18}
              color={active ? GOLD_DK : INK_SUB}
              strokeWidth={active ? 2.2 : 1.7}
            />
            {active && (
              <span style={{
                fontFamily: FS,
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 14.7,
                letterSpacing: '-0.005em',
                color: INK,
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            )}
            {!active && count !== null && (
              <span style={{
                fontFamily: FB,
                fontWeight: 700,
                fontSize: 9.5,
                color: MUTED,
                marginLeft: -2,
              }}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
