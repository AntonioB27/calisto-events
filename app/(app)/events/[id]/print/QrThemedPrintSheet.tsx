import type { AppUiDict } from "@/lib/app-ui/en";
import type { QrThemedTemplateId } from "@/lib/event-print/template-catalog";

import { QrCardSimple }     from "./QrCardSimple";
import { QrCardRomantic }   from "./QrCardRomantic";
import { QrCardLuxurious }  from "./QrCardLuxurious";
import { QrCardBotanical }  from "./QrCardBotanical";
import { QrCardArtDeco }    from "./QrCardArtDeco";
import { QrCardPlayful }    from "./QrCardPlayful";
import { QrCardCelestial }  from "./QrCardCelestial";
import { QrCardCoastal }    from "./QrCardCoastal";
import { QrCardBoho }       from "./QrCardBoho";
import { QrCardNoir }       from "./QrCardNoir";
import { QrCardWatercolor } from "./QrCardWatercolor";
import { QrCardRetro }      from "./QrCardRetro";
import { QrCardTropical }   from "./QrCardTropical";
import { QrCardScandi }     from "./QrCardScandi";
import { QrCardSunset }     from "./QrCardSunset";
import { QrCardRustic }     from "./QrCardRustic";

export type QrCardCopy = {
  body: string;
  tagline?: string;
  headline?: string;
  cta?: string;
  badge?: string;
  noirSub?: string;
};

export function buildQrCardCopy(template: QrThemedTemplateId, p: AppUiDict["print"]): QrCardCopy {
  switch (template) {
    case "qr-simple":     return { tagline: p.qrCardSimpleTagline,     headline: p.qrCardSimpleHeadline,   body: p.qrCardSimpleBody     };
    case "qr-romantic":   return { tagline: p.qrCardRomanticTagline,   body: p.qrCardRomanticBody,         cta: p.qrCardRomanticCta     };
    case "qr-luxurious":  return { body: p.qrCardLuxuriousBody };
    case "qr-botanical":  return { tagline: p.qrCardBotanicalTagline,  body: p.qrCardBotanicalBody };
    case "qr-art-deco":   return { body: p.qrCardArtDecoBody };
    case "qr-playful":    return { badge: p.qrCardPlayfulBadge, headline: p.qrCardPlayfulHeadline, body: p.qrCardPlayfulBody };
    case "qr-celestial":  return { tagline: p.qrCardCelestialTagline,  body: p.qrCardCelestialBody };
    case "qr-coastal":    return { tagline: p.qrCardCoastalTagline,    body: p.qrCardCoastalBody };
    case "qr-boho":       return { tagline: p.qrCardBohoTagline,       body: p.qrCardBohoBody };
    case "qr-noir":       return { noirSub: p.qrCardNoirSub, headline: p.qrCardNoirHeadline, body: p.qrCardNoirBody };
    case "qr-watercolor": return { tagline: p.qrCardWatercolorTagline, body: p.qrCardWatercolorBody };
    case "qr-retro":      return { badge: p.qrCardRetroBadge,          body: p.qrCardRetroBody };
    case "qr-tropical":   return { tagline: p.qrCardTropicalTagline,   body: p.qrCardTropicalBody };
    case "qr-scandi":     return { tagline: p.qrCardScandiTagline,     body: p.qrCardScandiBody };
    case "qr-sunset":     return { tagline: p.qrCardSunsetTagline,     body: p.qrCardSunsetBody };
    case "qr-rustic":     return { tagline: p.qrCardRusticTagline,     body: p.qrCardRusticBody };
  }
}

type CardProps = { eventTitle: string; accessCode: string; joinUrl: string; copy: QrCardCopy };

export function pickQrCard(template: QrThemedTemplateId, props: CardProps) {
  switch (template) {
    case "qr-simple":     return <QrCardSimple     {...props} />;
    case "qr-romantic":   return <QrCardRomantic   {...props} />;
    case "qr-luxurious":  return <QrCardLuxurious  {...props} />;
    case "qr-botanical":  return <QrCardBotanical  {...props} />;
    case "qr-art-deco":   return <QrCardArtDeco    {...props} />;
    case "qr-playful":    return <QrCardPlayful    {...props} />;
    case "qr-celestial":  return <QrCardCelestial  {...props} />;
    case "qr-coastal":    return <QrCardCoastal    {...props} />;
    case "qr-boho":       return <QrCardBoho       {...props} />;
    case "qr-noir":       return <QrCardNoir       {...props} />;
    case "qr-watercolor": return <QrCardWatercolor {...props} />;
    case "qr-retro":      return <QrCardRetro      {...props} />;
    case "qr-tropical":   return <QrCardTropical   {...props} />;
    case "qr-scandi":     return <QrCardScandi     {...props} />;
    case "qr-sunset":     return <QrCardSunset     {...props} />;
    case "qr-rustic":     return <QrCardRustic     {...props} />;
  }
}

type Props = { template: QrThemedTemplateId; eventTitle: string; accessCode: string; joinUrl: string; posterPrint: AppUiDict["print"] };

function Slot({ template, cardProps }: { template: QrThemedTemplateId; cardProps: CardProps }) {
  return (
    <div className="qr-themed-slot">
      <div className="qr-themed-card-rotate">
        {pickQrCard(template, cardProps)}
      </div>
    </div>
  );
}

export function QrThemedPrintSheet({ template, eventTitle, accessCode, joinUrl, posterPrint }: Props) {
  const copy = buildQrCardCopy(template, posterPrint);
  const cardProps = { eventTitle, accessCode, joinUrl, copy };
  return (
    <>
      {/* Mobile: single portrait card, no rotation, scaled to fit container */}
      <div className="qr-themed-desk qr-themed-desk--mobile qr-themed-mobile-only">
        <div className="qr-themed-mobile-card">
          <div className="qr-themed-mobile-card__scaler">
            {pickQrCard(template, cardProps)}
          </div>
        </div>
      </div>

      {/* Desktop: full A4 sheet with two rotated cards */}
      <div className="qr-themed-desktop-only">
        <div className="qr-themed-desk">
          <div className="qr-themed-page">
            <Slot template={template} cardProps={cardProps} />
            <div className="qr-themed-cut" aria-hidden />
            <Slot template={template} cardProps={cardProps} />
          </div>
        </div>
      </div>
    </>
  );
}
