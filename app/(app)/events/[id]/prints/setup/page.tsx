import { redirect } from "next/navigation";

// Keep existing links working; the workspace now owns all invitation editing.
export default async function PrintsSetupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/events/${id}/invitations`);
}
