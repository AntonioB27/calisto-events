import type { PosterTemplateId, PrintPaperId } from "@/lib/event-print/print-options";

import { PosterHalfCard, type PosterHalfStrings } from "./PosterHalfCard";

type EventPrintSheetProps = Readonly<{
  paper: PrintPaperId;
  template: PosterTemplateId;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  publicHostDisplay: string;
  halfStrings: PosterHalfStrings;
  cutHere: string;
}>;

function PrintPageRules({ paper }: Readonly<{ paper: PrintPaperId }>) {
  const pageSize = paper === "letter" ? "letter" : "A4";
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `@media print { @page { size: ${pageSize} portrait; margin: 10mm; } }`,
      }}
    />
  );
}

export function EventPrintSheet({
  paper,
  template,
  eventTitle,
  accessCode,
  joinUrl,
  publicHostDisplay,
  halfStrings,
  cutHere,
}: EventPrintSheetProps) {
  const outerClass =
    paper === "letter" ? "print-sheet-outer print-sheet-outer--letter" : "print-sheet-outer";

  const halfProps = {
    template,
    eventTitle,
    accessCode,
    joinUrl,
    publicHostDisplay,
    strings: halfStrings,
  };

  return (
    <>
      <PrintPageRules paper={paper} />
      <div className={outerClass}>
        <div className="print-two-up print-two-up-vfill">
          <PosterHalfCard {...halfProps} />
          <div className="print-cut-row" aria-hidden>
            <span className="print-cut-label">{cutHere}</span>
          </div>
          <PosterHalfCard {...halfProps} />
        </div>
      </div>
    </>
  );
}
