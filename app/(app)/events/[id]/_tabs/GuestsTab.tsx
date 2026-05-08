import { GuestsManager } from "./GuestsManager";

type GuestsTabProps = Readonly<{
  eventId: string;
}>;

export async function GuestsTab({ eventId }: GuestsTabProps) {
  return <GuestsManager eventId={eventId} />;
}
