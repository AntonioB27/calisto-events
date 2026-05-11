import { GalleryManager } from "./GalleryManager";

type GalleryTabProps = Readonly<{
  eventId: string;
  isPrimaryOrganizer: boolean;
}>;

export async function GalleryTab({ eventId, isPrimaryOrganizer }: GalleryTabProps) {
  return <GalleryManager eventId={eventId} isPrimaryOrganizer={isPrimaryOrganizer} />;
}
