"use client";

import { useAppUi } from "@/components/AppUiProvider";

type PrintsTabProps = Readonly<{
  eventId: string;
  eventKind: string;
  printsEventKindSetAt: string | null;
  eventDisplayName: string;
  eventDateIso: string;
  uiLocale: string;
  printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

export function PrintsTab({
  eventId,
  eventKind,
  printsEventKindSetAt,
  eventDisplayName,
  eventDateIso,
  uiLocale,
  printDraftByTemplateId,
}: PrintsTabProps) {
  const ui = useAppUi();

  return (
    <section className="prints-coming-soon">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&display=swap');

        .prints-coming-soon {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0e0d 0%, #1a1815 50%, #14130e 100%);
        }

        /* Animated background elements */
        .prints-coming-soon::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -10%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(197, 146, 42, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
        }

        .prints-coming-soon::after {
          content: '';
          position: absolute;
          bottom: -30%;
          left: -5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(197, 146, 42, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 10s ease-in-out infinite reverse;
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(30px) translateX(20px); }
        }

        /* Grid pattern overlay */
        .prints-coming-soon-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(90deg, rgba(197, 146, 42, 0.03) 1px, transparent 1px),
            linear-gradient(rgba(197, 146, 42, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          opacity: 0.5;
        }

        /* Decorative accent lines */
        .prints-coming-soon-accent-top {
          position: absolute;
          top: 15%;
          right: 10%;
          width: 300px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c5922a, transparent);
          opacity: 0.5;
          animation: slideInRight 1s ease-out;
        }

        .prints-coming-soon-accent-bottom {
          position: absolute;
          bottom: 15%;
          left: 10%;
          width: 250px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #c5922a, transparent);
          opacity: 0.5;
          animation: slideInLeft 1s ease-out 0.3s both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 0.5;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 0.5;
            transform: translateX(0);
          }
        }

        /* Main content container */
        .prints-coming-soon-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 900px;
          width: 100%;
        }

        /* Heading with gradient */
        .prints-coming-soon-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(56px, 12vw, 120px);
          font-weight: 900;
          letter-spacing: -2px;
          line-height: 1;
          margin: 0 0 24px 0;

          background: linear-gradient(
            135deg,
            #ffd700 0%,
            #ffed4e 25%,
            #c5922a 50%,
            #d4af37 75%,
            #f0e68c 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;

          animation: fadeInScale 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
          text-shadow: 0 0 30px rgba(197, 146, 42, 0.3);
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Divider */
        .prints-coming-soon-divider {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c5922a, #ffd700, #c5922a, transparent);
          margin: 0 auto 32px;
          animation: expandWidth 0.8s ease-out 0.3s both;
        }

        @keyframes expandWidth {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 80px;
            opacity: 1;
          }
        }

        /* Description text */
        .prints-coming-soon-description {
          font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
          font-size: clamp(16px, 2.5vw, 20px);
          line-height: 1.8;
          color: #d1c9bf;
          margin: 0;
          font-weight: 400;
          letter-spacing: 0.5px;
          animation: fadeInUp 0.9s ease-out 0.5s both;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .prints-coming-soon-description strong {
          color: #ffd700;
          font-weight: 600;
          letter-spacing: 1px;
        }

        /* Subtitle hint */
        .prints-coming-soon-hint {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #c5922a;
          margin-top: 40px;
          animation: fadeInUp 0.9s ease-out 0.7s both;
          opacity: 0.8;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .prints-coming-soon {
            min-height: auto;
            padding: 80px 20px;
          }

          .prints-coming-soon::before {
            width: 300px;
            height: 300px;
            top: -20%;
            right: -20%;
          }

          .prints-coming-soon::after {
            width: 250px;
            height: 250px;
            bottom: -20%;
            left: -20%;
          }

          .prints-coming-soon-heading {
            font-size: 48px;
            letter-spacing: -1px;
          }

          .prints-coming-soon-accent-top,
          .prints-coming-soon-accent-bottom {
            display: none;
          }

          .prints-coming-soon-description {
            font-size: 16px;
          }
        }

        /* Subtle shimmer effect on heading */
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .prints-coming-soon-heading {
          background-size: 200% 100%;
          animation: fadeInScale 0.9s cubic-bezier(0.34, 1.56, 0.64, 1),
                      shimmer 3s linear 1.5s infinite;
        }
      `}</style>

      <div className="prints-coming-soon-grid" />
      <div className="prints-coming-soon-accent-top" />
      <div className="prints-coming-soon-accent-bottom" />

      <div className="prints-coming-soon-content">
        <h2 className="prints-coming-soon-heading">Coming Soon</h2>

        <div className="prints-coming-soon-divider" />

        <p className="prints-coming-soon-description">
          Bring your celebration to life with <strong>bespoke printed materials</strong>.
          Custom invitations, programs, and keepsakes crafted with meticulous attention to detail.
          We're perfecting this feature to deliver something truly extraordinary.
        </p>

        <div className="prints-coming-soon-hint">✨ Something Special is Brewing ✨</div>
      </div>
    </section>
  );
}
