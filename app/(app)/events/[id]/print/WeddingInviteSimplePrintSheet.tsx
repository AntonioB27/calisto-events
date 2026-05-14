import type { CSSProperties } from "react";
import QRCode from "react-qr-code";

import type { PrintPaperId } from "@/lib/event-print/print-options";

export type WeddingInviteSimplePrintStrings = Readonly<{
  qrEyebrow: string;
  footerGoToLead: string;
  footerGoToTrail: string;
}>;

type WeddingInviteSimplePrintSheetProps = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  joinUrl: string;
  accessCode: string;
  publicHostDisplay: string;
  strings: WeddingInviteSimplePrintStrings;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageSize = paper === "letter" ? "letter" : "A4";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { @page { size: ${pageSize} portrait; margin: 12mm; } }`,
      }}
    />
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
  joinUrl,
  accessCode,
  publicHostDisplay,
  strings,
}: WeddingInviteSimplePrintSheetProps) {
  const a = partnerA.trim();
  const b = partnerB.trim();
  const singleName = !b || b === a;
  const venueLine = venue.trim();
  const tag = extraLine.trim();

  const outerClass = paper === "letter" ? "print-invite-outer print-invite-outer--letter" : "print-invite-outer";

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <article className="print-invite-card" data-template="wedding-invite-simple" aria-label={strings.qrEyebrow}>
          <div className="print-invite-rule" aria-hidden />
          <div className="print-invite-body">
            {singleName ? (
              <h1 className="print-invite-name print-invite-name--single" style={nameClamp}>
                {a || "\u00a0"}
              </h1>
            ) : (
              <>
                <h1 className="print-invite-name" style={nameClamp}>
                  {a || "\u00a0"}
                </h1>
                <p className="print-invite-ampersand" aria-hidden>
                  &
                </p>
                <h1 className="print-invite-name" style={nameClamp}>
                  {b}
                </h1>
              </>
            )}
            {venueLine ? <p className="print-invite-venue">{venueLine}</p> : null}
            {tag ? <p className="print-invite-tagline">{tag}</p> : null}
          </div>
          <div className="print-invite-footer">
            <p className="print-invite-qr-eyebrow">{strings.qrEyebrow}</p>
            <div className="print-invite-qr-frame">
              <QRCode value={joinUrl} size={168} />
            </div>
            <p className="print-invite-footer-lead">
              {strings.footerGoToLead}
              <span style={{ fontFamily: "ui-monospace, monospace" }}>{publicHostDisplay}</span>
              {strings.footerGoToTrail}
            </p>
            <p className="print-invite-code-pill">{accessCode}</p>
            <p className="print-invite-join-url">{joinUrl}</p>
          </div>
        </article>
      </div>
    </>
  );
}
