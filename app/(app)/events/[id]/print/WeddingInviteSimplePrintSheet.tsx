import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  guessTimeTokenFromExtraLine,
  isExtraLineSameAsFormattedDate,
  weddingInviteDateParts,
} from "@/lib/event-print/wedding-invite-date-parts";

export type WeddingInviteSimplePrintStrings = Readonly<{
  togetherWithFamilies: string;
  inviteCelebrationOn: string;
  receptionToFollow: string;
}>;

type WeddingInviteSimplePrintSheetProps = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  strings: WeddingInviteSimplePrintStrings;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  /** Exact ISO A4 (210×297mm) or US Letter; zero margin so one invitation fills the sheet. */
  const pageDecl =
    paper === "letter"
      ? "@page { size: letter portrait; margin: 0; }"
      : "@page { size: 210mm 297mm portrait; margin: 0; }";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { ${pageDecl} }`,
      }}
    />
  );
}

/**
 * Botanical wreath built from 24 SVG leaf paths arranged programmatically
 * around a circle. Alternates larger/smaller leaves for natural density.
 */
function InviteWreath() {
  const CX = 120;
  const CY = 120;
  const LEAF_COUNT = 24;
  const BASE_R = 70; // radius to leaf base

  return (
    <svg className="print-invite-botanical__wreathSvg" viewBox="0 0 240 240" aria-hidden>
      {/* Thin inner ring — frames the names */}
      <circle cx={CX} cy={CY} r={54} fill="none" stroke="#8a9e82" strokeWidth={0.55} opacity={0.32} />

      {/* Leaves: 24 evenly spaced, alternating large/small */}
      {Array.from({ length: LEAF_COUNT }, (_, i) => {
        const angle = (i * 360) / LEAF_COUNT;
        const isMain = i % 2 === 0;
        return (
          <g key={i} transform={`translate(${CX},${CY}) rotate(${angle}) translate(0,${-BASE_R})`}>
            {isMain ? (
              <path d="M 0 0 Q 5 -9 0 -18 Q -5 -9 0 0 Z" fill="#5e7a52" />
            ) : (
              <path d="M 0 0 Q 3.5 -6.5 0 -13 Q -3.5 -6.5 0 0 Z" fill="#7a9870" opacity={0.78} />
            )}
          </g>
        );
      })}

      {/* Thin outer ring — completes the wreath frame */}
      <circle cx={CX} cy={CY} r={90} fill="none" stroke="#8a9e82" strokeWidth={0.45} opacity={0.22} />
    </svg>
  );
}

/**
 * One corner sprig (top-left orientation). CSS mirrors it for the other three corners.
 * Two curved stems grow from the corner; leaves branch off each stem pointing inward.
 */
function CornerSprig() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden>
      {/* Stem along top edge */}
      <path d="M 4 3 C 22 3 44 7 58 22" fill="none" stroke="#6b8260" strokeWidth={0.85} strokeLinecap="round" opacity={0.65} />
      {/* Stem along left edge */}
      <path d="M 3 4 C 3 22 7 44 22 58" fill="none" stroke="#6b8260" strokeWidth={0.85} strokeLinecap="round" opacity={0.65} />

      {/* Leaves on top stem — branch downward */}
      <g transform="translate(14, 4) rotate(175)">
        <path d="M 0 0 Q 5 -9 0 -18 Q -5 -9 0 0 Z" fill="#5e7a52" />
      </g>
      <g transform="translate(30, 8) rotate(162)">
        <path d="M 0 0 Q 4 -7 0 -15 Q -4 -7 0 0 Z" fill="#7a9870" />
      </g>
      <g transform="translate(46, 16) rotate(180)">
        <path d="M 0 0 Q 3.5 -6 0 -12 Q -3.5 -6 0 0 Z" fill="#5e7a52" />
      </g>

      {/* Leaves on left stem — branch rightward */}
      <g transform="translate(4, 14) rotate(85)">
        <path d="M 0 0 Q 5 -9 0 -18 Q -5 -9 0 0 Z" fill="#5e7a52" />
      </g>
      <g transform="translate(8, 30) rotate(98)">
        <path d="M 0 0 Q 4 -7 0 -15 Q -4 -7 0 0 Z" fill="#7a9870" />
      </g>
      <g transform="translate(16, 46) rotate(82)">
        <path d="M 0 0 Q 3.5 -6 0 -12 Q -3.5 -6 0 0 Z" fill="#5e7a52" />
      </g>

      {/* Larger diagonal leaf from the corner junction */}
      <g transform="translate(8, 8) rotate(133)">
        <path d="M 0 0 Q 5.5 -10 0 -21 Q -5.5 -10 0 0 Z" fill="#5e7a52" />
      </g>
    </svg>
  );
}

function CornerBotanicals() {
  return (
    <>
      <div className="print-invite-botanical__corner-deco print-invite-botanical__corner-deco--tl"><CornerSprig /></div>
      <div className="print-invite-botanical__corner-deco print-invite-botanical__corner-deco--tr"><CornerSprig /></div>
      <div className="print-invite-botanical__corner-deco print-invite-botanical__corner-deco--bl"><CornerSprig /></div>
      <div className="print-invite-botanical__corner-deco print-invite-botanical__corner-deco--br"><CornerSprig /></div>
    </>
  );
}

/** Thin ornamental line divider with a centered diamond accent. */
function BotanicalLine() {
  return (
    <svg
      className="print-invite-botanical__line"
      viewBox="0 0 180 14"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <line x1="0" y1="7" x2="78" y2="7" stroke="#b0a898" strokeWidth="0.65" />
      <path d="M 90 3 L 94 7 L 90 11 L 86 7 Z" fill="#7a9870" opacity="0.72" />
      <line x1="102" y1="7" x2="180" y2="7" stroke="#b0a898" strokeWidth="0.65" />
    </svg>
  );
}

const nameClamp: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 3,
  overflow: "hidden",
};

export function WeddingInviteSimplePrintSheet({
  paper,
  partnerA,
  partnerB,
  venue,
  extraLine,
  eventDateIso,
  locale,
  strings,
}: WeddingInviteSimplePrintSheetProps) {
  const a = partnerA.trim();
  const b = partnerB.trim();
  const singleName = !b || b === a;
  const venueLine = venue.trim();
  const timeToken = guessTimeTokenFromExtraLine(extraLine);
  const dateParts = weddingInviteDateParts(eventDateIso, locale);
  const hideExtraAsDuplicate = isExtraLineSameAsFormattedDate(extraLine, eventDateIso, locale);
  const supplementalLine =
    extraLine.trim() && !hideExtraAsDuplicate && !timeToken ? extraLine.trim() : null;

  const paperMod = paper === "letter" ? "print-invite-botanical--letter" : "print-invite-botanical--a4";
  const outerClass = `print-invite-outer print-invite-botanical ${paperMod}`;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article
          className="print-invite-botanical__card"
          data-template="wedding-invite-simple"
          aria-label={strings.togetherWithFamilies}
        >
          <CornerBotanicals />
          <div className="print-invite-botanical__top">
            <p className="print-invite-botanical__eyebrow">{strings.togetherWithFamilies}</p>
            <BotanicalLine />

            <div className="print-invite-botanical__wreathBlock">
              <InviteWreath />
              <div className="print-invite-botanical__names">
                {singleName ? (
                  <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                    {a || " "}
                  </h1>
                ) : (
                  <>
                    <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                      {a || " "}
                    </h1>
                    <p className="print-invite-botanical__ampersand" aria-hidden>
                      &
                    </p>
                    <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                      {b}
                    </h1>
                  </>
                )}
              </div>
            </div>

            <p className="print-invite-botanical__eyebrow print-invite-botanical__eyebrow--tight">{strings.inviteCelebrationOn}</p>

            {dateParts ? (
              <div className="print-invite-botanical__dateBlock">
                <p className="print-invite-botanical__dateMonth">{dateParts.month}</p>
                <div className="print-invite-botanical__dateDayRow">
                  <span className="print-invite-botanical__hairline" aria-hidden />
                  <p className="print-invite-botanical__dateNum">{dateParts.day}</p>
                  <span className="print-invite-botanical__hairline" aria-hidden />
                </div>
                <p className="print-invite-botanical__dateWeekday">{dateParts.weekday}</p>
                <p className="print-invite-botanical__dateYear">
                  {timeToken ? `${dateParts.year} · ${timeToken}` : dateParts.year}
                </p>
              </div>
            ) : null}

            {supplementalLine ? <p className="print-invite-botanical__supplement">{supplementalLine}</p> : null}
          </div>

          <div className="print-invite-botanical__bottom">
            {venueLine ? <p className="print-invite-botanical__venue">{venueLine}</p> : null}
            <p className="print-invite-botanical__script print-invite-botanical__reception">{strings.receptionToFollow}</p>
            <BotanicalLine />
          </div>
        </article>
      </div>
    </>
  );
}
