"use client";

import Link from "next/link";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type DemoToastContextValue = { triggerDemoToast: () => void };

const DemoToastContext = createContext<DemoToastContextValue>({
  triggerDemoToast: () => {},
});

export function useDemoToast() {
  return useContext(DemoToastContext);
}

export function DemoToastProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const triggerDemoToast = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const contextValue = useMemo(() => ({ triggerDemoToast }), [triggerDemoToast]);

  return (
    <DemoToastContext.Provider value={contextValue}>
      {children}
      {visible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "rgba(20,14,6,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            color: "#fff",
            borderRadius: 14,
            padding: "12px 20px",
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.1)",
            whiteSpace: "nowrap",
          }}
        >
          <span>This is a demo</span>
          <Link
            href="/auth/register"
            style={{
              color: "#C5922A",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 12,
              background: "rgba(197,146,42,0.18)",
              padding: "4px 10px",
              borderRadius: 8,
              border: "1px solid rgba(197,146,42,0.38)",
            }}
          >
            Sign up →
          </Link>
        </div>
      )}
    </DemoToastContext.Provider>
  );
}
