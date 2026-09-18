import { notFound } from 'next/navigation';
import { InvitationsEditor } from '../(app)/events/[id]/_tabs/InvitationsEditor';
export default function Review() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <main style={{ maxWidth: 1280, margin: 'auto', padding: 24, width: '100%' }}><h1>Invitation workspace · sample content</h1><InvitationsEditor eventId="review-fixture" eventKind="wedding" eventDisplayName="Ana & Luka" eventDateIso="2027-06-19" uiLocale="hr" printDraftByTemplateId={{}} /></main>;
}
