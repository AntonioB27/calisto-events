import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import { formatEventDateForPrintField } from "@/lib/event-print/print-field-defaults";

export type WeddingInviteGoldCirclesPhotoStrings = Readonly<{
  youreInvited: string;
  and: string;
  receptionToFollow: string;
}>;

type Props = Readonly<{
  paper: PrintPaperId;
  partnerA: string;
  partnerB: string;
  venue: string;
  extraLine: string;
  eventDateIso: string;
  locale: Locale;
  photoUrl: string | null;
  cropX: number;
  cropY: number;
  cropScale: number;
  strings: WeddingInviteGoldCirclesPhotoStrings;
  visibility: InvitationFieldVisibility;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
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

export function WeddingInviteGoldCirclesPhotoPrintSheet({
  paper,
  partnerA,
  partnerB,
  venue,
  extraLine,
  eventDateIso,
  locale,
  photoUrl,
  cropX,
  cropY,
  cropScale,
  strings,
  visibility,
}: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) =>
    showInvitationField(visibility, key);

  const a = partnerA.trim();
  const b = partnerB.trim();
  const dateLine = show("event_date") ? formatEventDateForPrintField(eventDateIso, locale) : null;

  const paperMod =
    paper === "letter"
      ? "print-invite-gold-circles--letter"
      : "print-invite-gold-circles--a4";

  const photoFrameStyle: CSSProperties = {
    "--gc-scale": cropScale,
    "--gc-crop-x": `${cropX}px`,
    "--gc-crop-y": `${cropY}px`,
  } as CSSProperties;

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={`print-invite-outer print-invite-gold-circles ${paperMod}`}>
        <article
          className="print-invite-gold-circles__card"
          data-template="wedding-invite-gold-circles-photo"
        >
          {photoUrl ? (
            <div className="print-invite-gold-circles__photoFrame" style={photoFrameStyle}>
              <img
                src={photoUrl}
                alt=""
                className="print-invite-gold-circles__photo"
                draggable={false}
              />
            </div>
          ) : null}

          <div className="print-invite-gold-circles__textZone">
            {show("invite_preamble") ? (
              <p className="print-invite-gold-circles__preamble">{strings.youreInvited}</p>
            ) : null}

            {show("partner_names") ? (
              <p className="print-invite-gold-circles__names">
                {a.toUpperCase() || " "}&nbsp;{strings.and.toUpperCase()}&nbsp;{b.toUpperCase() || " "}
              </p>
            ) : null}

            {dateLine ? (
              <p className="print-invite-gold-circles__dateLine">{dateLine}</p>
            ) : null}

            {show("venue") && venue.trim() ? (
              <p className="print-invite-gold-circles__venueLine">{venue.trim()}</p>
            ) : null}

            {show("extra_line") && extraLine.trim() ? (
              <p className="print-invite-gold-circles__extraLine">{extraLine.trim()}</p>
            ) : null}

            {show("reception") ? (
              <p className="print-invite-gold-circles__extraLine">{strings.receptionToFollow}</p>
            ) : null}
          </div>
        </article>
      </div>
    </>
  );
}
