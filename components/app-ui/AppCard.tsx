"use client";

import { useState } from "react";

type AppCardProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
};

export function AppCard({ children, style = {}, onClick, hover }: AppCardProps) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--app-card)',
        borderRadius: 18,
        border: '1.5px solid var(--app-border)',
        boxShadow: hov && hover ? '0 8px 32px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.18s',
        transform: hov && hover ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
