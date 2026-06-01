import type { CSSProperties } from "react";
import QRCode from "react-qr-code";

import type { PosterTemplateId } from "@/lib/event-print/print-options";

const titleClamp: CSSProperties = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
};

export type PosterHalfStrings = Readonly<{
  heroEyebrow: string;
  footerGoToLead: string;
  footerGoToTrail: string;
}>;

type PosterHalfCardProps = Readonly<{
  template: PosterTemplateId;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  publicHostDisplay: string;
  strings: PosterHalfStrings;
}>;

const QR_SIZE: Record<PosterTemplateId, number> = {
  "table-minimal": 200,
  "table-bold": 192,
  "qr-clean": 176,
  "qr-gold": 176,
  "qr-dark": 176,
};

function isQrHeroTemplate(t: PosterTemplateId): boolean {
  return t.startsWith("qr-");
}

export function PosterHalfCard({
  template,
  eventTitle,
  accessCode,
  joinUrl,
  publicHostDisplay,
  strings,
}: PosterHalfCardProps) {
  if (isQrHeroTemplate(template)) {
    return (
      <section className="print-half-card" data-template={template} aria-label={strings.heroEyebrow}>
        <div className="print-qr-header">
          <h1 className="print-poster-title" style={titleClamp}>
            {eventTitle}
          </h1>
        </div>
        <div className="print-qr-body">
          <div className="print-qr-frame">
            <QRCode value={joinUrl} size={QR_SIZE[template]} />
          </div>
        </div>
        <div className="print-qr-footer">
          <p className="print-code-pill">{accessCode}</p>
          <p className="print-scan-hint">{strings.heroEyebrow}</p>
          <p className="print-join-url">{joinUrl}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="print-half-card" data-template={template} aria-label={strings.heroEyebrow}>
      <p className="print-poster-eyebrow">{strings.heroEyebrow}</p>
      <h1 className="print-poster-title" style={titleClamp}>
        {eventTitle}
      </h1>
      <div className="print-qr-frame">
        <QRCode value={joinUrl} size={QR_SIZE[template]} />
      </div>
      <p className="print-footer-lead">
        {strings.footerGoToLead}
        <span style={{ fontFamily: "ui-monospace, monospace" }}>{publicHostDisplay}</span>
        {strings.footerGoToTrail}
      </p>
      <p className="print-code-pill">{accessCode}</p>
      <p className="print-join-url">{joinUrl}</p>
    </section>
  );
}
