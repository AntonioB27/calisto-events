import type { AppUiDict } from "@/lib/app-ui/en";

type LeaveRpcMessages = AppUiDict["leaveRpc"];

/** Friendly copy for Postgres `leave_event` RPC failures. */
export function mapLeaveEventRpcError(raw: string, copy: LeaveRpcMessages): string {
  const m = raw.toLowerCase();
  if (m.includes("primary_organizer_cannot_leave")) {
    return copy.primaryOrganizer;
  }
  if (m.includes("not_a_member")) {
    return copy.notMember;
  }
  if (m.includes("not_authenticated")) {
    return copy.notAuth;
  }
  return raw.trim() || copy.fallback;
}
