"use client";
import { type CSSProperties, type ReactNode } from 'react';
import { invitationFormat } from '@/lib/event-print/invitation-document';
import './invitation-workspace.css';

/** A fixed physical layout scaled only for display, shared by editor and print. */
export function InvitationCanvas({ fields, children, guides = false, preview = false }: { fields: Record<string, string>; children: ReactNode; guides?: boolean; preview?: boolean }) {
  const format = invitationFormat(fields);
  // A proof preview shows the finished, trimmed card. The print route retains
  // the full bleed sheet, so artwork never appears cut off at the card edge.
  const bleed = preview || fields.print_bleed === '0' ? 0 : 3;
  const outerW = format.width + bleed * 2;
  const outerH = format.height + bleed * 2;
  // Keep the original A4 artwork's exact geometry in preview and export.
  const artScale = Math.max(format.width / 210, format.height / 297);
  const style = {
    '--invite-text-scale': Number(fields.font_scale || 100) / 100,
    '--proof-width': `${outerW}mm`, '--proof-height': `${outerH}mm`,
    '--trim-width': `${format.width}mm`, '--trim-height': `${format.height}mm`,
    '--proof-bleed': `${bleed}mm`, '--art-scale': artScale,
  } as CSSProperties;
  return <div className="invitation-canvas" style={{ ...style, aspectRatio: `${outerW} / ${outerH}` }}>
    <div className="invitation-canvas__paper" data-invitation-proof>
      {/* This layer extends only the artwork into bleed; type stays on trim. */}
      {bleed > 0 && <div className="invitation-canvas__bleed" aria-hidden="true"><div className="invitation-canvas__art">{children}</div></div>}
      <div className="invitation-canvas__trim"><div className="invitation-canvas__art">{children}</div></div>
      {guides && <div className="invitation-canvas__guides" aria-hidden="true" />}
    </div>
    <style>{`@media print { @page { size: ${outerW}mm ${outerH}mm; margin: 0; } }`}</style>
  </div>;
}
