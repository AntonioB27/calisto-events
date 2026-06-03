import Link from "next/link";
import { redirect } from "next/navigation";
import { Key, LayoutDashboard, Plus } from "lucide-react";

import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { getWelcomePageCopy } from "@/lib/welcome-page-copy";

export default async function OnboardingPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/welcome");

  const locale = await getUiLocale();
  const copy = getWelcomePageCopy(locale);

  const GOLD = "#C5922A";
  const PURPLE = "#5B2D8E";
  const INK = "#221509";
  const MUTED = "#9A8570";
  const FS = "'DM Serif Display', serif";
  const FB = "'DM Sans', sans-serif";

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.62)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.78)",
    boxShadow: "0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
    borderRadius: 14,
    padding: 20,
    display: "flex",
    alignItems: "center",
    gap: 16,
    textDecoration: "none",
    cursor: "pointer",
  };

  return (
    <main
      className="app-shell welcome-reveal"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{ width: 32, height: 3, background: GOLD, borderRadius: 2, margin: "0 auto 16px" }}
          />
          <h1
            style={{
              fontFamily: FS,
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(28px, 8vw, 38px)",
              color: INK,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {copy.onboardingHeading}
          </h1>
        </div>

        {/* Two glass tiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/events/new" style={glass}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${GOLD}18`,
                border: `1px solid ${GOLD}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Plus size={22} color={GOLD} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FS,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: INK,
                  lineHeight: 1.2,
                }}
              >
                {copy.onboardingCreateTitle}
              </div>
              <div
                style={{ fontFamily: FB, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}
              >
                {copy.onboardingCreateSub}
              </div>
            </div>
          </Link>

          <Link href="/join" style={glass}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${PURPLE}18`,
                border: `1px solid ${PURPLE}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Key size={20} color={PURPLE} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FS,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: INK,
                  lineHeight: 1.2,
                }}
              >
                {copy.onboardingJoinTitle}
              </div>
              <div
                style={{ fontFamily: FB, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}
              >
                {copy.onboardingJoinSub}
              </div>
            </div>
          </Link>

          <Link href="/dashboard" style={glass}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${INK}10`,
                border: `1px solid ${INK}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <LayoutDashboard size={20} color={INK} />
            </div>
            <div>
              <div
                style={{
                  fontFamily: FS,
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: 18,
                  color: INK,
                  lineHeight: 1.2,
                }}
              >
                {copy.onboardingDashboardTitle}
              </div>
              <div
                style={{ fontFamily: FB, fontSize: 13, color: MUTED, marginTop: 3, lineHeight: 1.4 }}
              >
                {copy.onboardingDashboardSub}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
