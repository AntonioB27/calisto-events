import { GalleryManager } from "./GalleryManager";

type GalleryTabProps = Readonly<{
  eventId: string;
  isPrimaryOrganizer: boolean;
  moderationEnabled: boolean;
  organizerGalleryReviewedAt: string | null;
}>;

export async function GalleryTab({
  eventId,
  isPrimaryOrganizer,
  moderationEnabled,
  organizerGalleryReviewedAt,
}: GalleryTabProps) {
  return (
    <GalleryManager
      eventId={eventId}
      isPrimaryOrganizer={isPrimaryOrganizer}
      moderationEnabled={moderationEnabled}
      organizerGalleryReviewedAt={organizerGalleryReviewedAt}
    />
  );
}
