import {
  type InvitationFieldVisibility,
  showInvitationField,
} from "@/lib/event-print/invitation-field-visibility";
import type { WeddingInviteDetails, WeddingInviteDetailsStrings } from "@/lib/event-print/wedding-invite-details";

type Props = Readonly<{
  details: WeddingInviteDetails;
  strings: WeddingInviteDetailsStrings;
  partnerAName: string;
  partnerBName: string;
  visibility?: InvitationFieldVisibility;
}>;

function Section({ label, address, time }: { label: string; address: string; time: string }) {
  if (!address && !time) return null;
  return (
    <div className="print-invite-details__section">
      <p className="print-invite-details__label">{label}</p>
      {address ? <p className="print-invite-details__text">{address}</p> : null}
      {time ? <p className="print-invite-details__text">{time}</p> : null}
    </div>
  );
}

export function WeddingInviteDetailsBlock({
  details,
  strings,
  partnerAName,
  partnerBName,
  visibility,
}: Props) {
  const show = (key: Parameters<typeof showInvitationField>[1]) =>
    visibility ? showInvitationField(visibility, key) : true;

  const {
    gatheringType,
    gatheringAddress, gatheringTime,
    partnerAGatheringAddress, partnerAGatheringTime,
    partnerBGatheringAddress, partnerBGatheringTime,
    churchAddress, churchTime,
    dinnerAddress, dinnerTime,
    quoteText, quoteAuthor,
  } = details;

  const hasGatheringSame =
    show("gathering") && gatheringType === "same" && (gatheringAddress || gatheringTime);
  const hasGatheringSeparate =
    show("gathering") &&
    gatheringType === "separate" &&
    (partnerAGatheringAddress || partnerAGatheringTime || partnerBGatheringAddress || partnerBGatheringTime);
  const hasChurch = show("church") && !!(churchAddress || churchTime);
  const hasDinner = show("dinner") && !!(dinnerAddress || dinnerTime);

  if (
    !hasGatheringSame &&
    !hasGatheringSeparate &&
    !hasChurch &&
    !hasDinner &&
    !(show("quote") && quoteText)
  ) {
    return null;
  }

  return (
    <>
      {hasGatheringSame ? (
        <Section label={strings.gatheringTitle} address={gatheringAddress} time={gatheringTime} />
      ) : hasGatheringSeparate ? (
        <div className="print-invite-details__section">
          <p className="print-invite-details__label">{strings.gatheringTitle}</p>
          <div className="print-invite-details__splitRow">
            <div className="print-invite-details__splitCol">
              <p className="print-invite-details__partnerName">{partnerAName}</p>
              {partnerAGatheringAddress ? <p className="print-invite-details__text">{partnerAGatheringAddress}</p> : null}
              {partnerAGatheringTime ? <p className="print-invite-details__text">{partnerAGatheringTime}</p> : null}
            </div>
            <div className="print-invite-details__splitDivider" aria-hidden="true" />
            <div className="print-invite-details__splitCol">
              <p className="print-invite-details__partnerName">{partnerBName}</p>
              {partnerBGatheringAddress ? <p className="print-invite-details__text">{partnerBGatheringAddress}</p> : null}
              {partnerBGatheringTime ? <p className="print-invite-details__text">{partnerBGatheringTime}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {hasChurch ? (
        <Section label={strings.churchTitle} address={churchAddress} time={churchTime} />
      ) : null}

      {hasDinner ? (
        <Section label={strings.dinnerTitle} address={dinnerAddress} time={dinnerTime} />
      ) : null}

      {show("quote") && quoteText ? (
        <div className="print-invite-details__section">
          <p className="print-invite-details__quote">"{quoteText}"</p>
          {quoteAuthor ? <p className="print-invite-details__text">— {quoteAuthor}</p> : null}
        </div>
      ) : null}
    </>
  );
}
