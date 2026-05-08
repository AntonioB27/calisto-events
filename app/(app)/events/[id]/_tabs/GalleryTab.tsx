import { GalleryManager } from "./GalleryManager";

type GalleryTabProps = Readonly<{
  eventId: string;
}>;

export async function GalleryTab({ eventId }: GalleryTabProps) {
  return <GalleryManager eventId={eventId} />;
}
