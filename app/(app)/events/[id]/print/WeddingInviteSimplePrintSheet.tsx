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

function InviteWreath() {
  return (
    <svg className="print-invite-botanical__wreathSvg" viewBox="0 0 240 240" aria-hidden>
      <circle cx="120" cy="120" r="102" fill="none" stroke="#8faa8f" strokeWidth={1.15} opacity={0.95} />
      <circle cx="120" cy="120" r="96" fill="none" stroke="#b8d4ae" strokeWidth={0.65} opacity={0.55} />
      <circle cx="120" cy="120" r="90" fill="none" stroke="#dfead8" strokeWidth={0.4} opacity={0.4} />
      <path
        d="M 188 78 C 214 96 210 138 178 162"
        fill="none"
        stroke="#5d7a56"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M 182 92 Q 198 108 188 128 M 192 100 L 202 92 M 186 118 L 198 112"
        fill="none"
        stroke="#5d7a56"
        strokeWidth={1.05}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Watercolor-style blooms + lavender wash (no baked text). */
function InviteFloralArt() {
  return (
    <svg className="print-invite-botanical__floralSvg" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden>
      <defs>
        <radialGradient id="invBloomA" cx="35%" cy="22%" r="55%">
          <stop offset="0%" stopColor="rgba(155, 95, 160, 0.55)" />
          <stop offset="55%" stopColor="rgba(200, 160, 205, 0.22)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="invBloomB" cx="78%" cy="18%" r="50%">
          <stop offset="0%" stopColor="rgba(175, 140, 195, 0.45)" />
          <stop offset="60%" stopColor="rgba(220, 200, 235, 0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="invBloomC" cx="18%" cy="88%" r="48%">
          <stop offset="0%" stopColor="rgba(140, 85, 150, 0.5)" />
          <stop offset="65%" stopColor="rgba(190, 140, 185, 0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="invBloomD" cx="85%" cy="86%" r="52%">
          <stop offset="0%" stopColor="rgba(130, 75, 145, 0.52)" />
          <stop offset="58%" stopColor="rgba(175, 120, 170, 0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <radialGradient id="invLeaf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(95, 130, 88, 0.35)" />
          <stop offset="100%" stopColor="rgba(95, 130, 88, 0)" />
        </radialGradient>
      </defs>
      <rect width="400" height="560" fill="url(#invBloomA)" />
      <rect width="400" height="560" fill="url(#invBloomB)" />
      <rect width="400" height="560" fill="url(#invBloomC)" />
      <rect width="400" height="560" fill="url(#invBloomD)" />
      <ellipse cx="72" cy="48" rx="38" ry="28" fill="url(#invLeaf)" transform="rotate(-25 72 48)" />
      <ellipse cx="330" cy="520" rx="44" ry="34" fill="url(#invLeaf)" transform="rotate(18 330 520)" />
      <g fill="rgba(212, 175, 55, 0.35)" opacity={0.9}>
        <circle cx="310" cy="64" r="1.2" />
        <circle cx="328" cy="88" r="0.9" />
        <circle cx="292" cy="102" r="1" />
        <circle cx="88" cy="498" r="1.1" />
        <circle cx="52" cy="472" r="0.85" />
      </g>
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
          <InviteFloralArt />
          <div className="print-invite-botanical__corners" aria-hidden>
            <span className="print-invite-botanical__corner print-invite-botanical__corner--tl" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--tr" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--bl" />
            <span className="print-invite-botanical__corner print-invite-botanical__corner--br" />
          </div>

          <div className="print-invite-botanical__top">
            <p className="print-invite-botanical__eyebrow">{strings.togetherWithFamilies}</p>

            <div className="print-invite-botanical__wreathBlock">
              <InviteWreath />
              <div className="print-invite-botanical__names">
                {singleName ? (
                  <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                    {a || "\u00a0"}
                  </h1>
                ) : (
                  <>
                    <h1 className="print-invite-botanical__script print-invite-botanical__namesLine" style={nameClamp}>
                      {a || "\u00a0"}
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
                <div className="print-invite-botanical__dateRow">
                  <div className="print-invite-botanical__dateSide">
                    <span className="print-invite-botanical__hairline" aria-hidden />
                    <span className="print-invite-botanical__dateSideText">{dateParts.weekday}</span>
                    <span className="print-invite-botanical__hairline" aria-hidden />
                  </div>
                  <p className="print-invite-botanical__dateNum">{dateParts.day}</p>
                  <div className="print-invite-botanical__dateSide">
                    <span className="print-invite-botanical__hairline" aria-hidden />
                    <span className="print-invite-botanical__dateSideText">{timeToken ?? "\u00a0"}</span>
                    <span className="print-invite-botanical__hairline" aria-hidden />
                  </div>
                </div>
                <p className="print-invite-botanical__dateYear">{dateParts.year}</p>
              </div>
            ) : null}

            {supplementalLine ? <p className="print-invite-botanical__supplement">{supplementalLine}</p> : null}
          </div>

          <div className="print-invite-botanical__bottom">
            {venueLine ? <p className="print-invite-botanical__venue">{venueLine}</p> : null}

            <p className="print-invite-botanical__script print-invite-botanical__reception">{strings.receptionToFollow}</p>
          </div>
        </article>
      </div>
    </>
  );
}
