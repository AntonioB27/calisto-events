import type { AppUiDict } from "@/lib/app-ui/en";

type GuestJoinMsgs = Pick<AppUiDict["guestJoin"], "joinInvalidOrNotFound" | "joinAlreadyMember" | "joinGeneric">;

export function mapGuestJoinRpcError(raw: string, copy: GuestJoinMsgs): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid") || m.includes("not found")) return copy.joinInvalidOrNotFound;
  if (m.includes("already")) return copy.joinAlreadyMember;
  return raw.trim() || copy.joinGeneric;
}
