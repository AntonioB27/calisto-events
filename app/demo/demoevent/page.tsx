import { resolveDemoRole, resolveDemoTab } from "./demo-role";
import { getPublicOrigin } from "@/lib/public-origin";
import { DemoToastProvider } from "./_components/DemoToastProvider";
import { DemoRoleToggle } from "./_components/DemoRoleToggle";
import { DemoOrganizerView } from "./_components/DemoOrganizerView";
import { DemoGuestView } from "./_components/DemoGuestView";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DemoEventPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const rawRole = typeof params.role === "string" ? params.role : undefined;
  const rawTab  = typeof params.tab  === "string" ? params.tab  : undefined;

  const role = resolveDemoRole(rawRole);
  const tab  = resolveDemoTab(rawTab);
  const publicOrigin = await getPublicOrigin();

  return (
    <DemoToastProvider>
      <div className="app-shell flex flex-col">
        <DemoRoleToggle currentRole={role} currentTab={tab} />
        <div className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {role === "organizer" ? (
            <DemoOrganizerView selectedTab={tab} publicOrigin={publicOrigin} />
          ) : (
            <DemoGuestView />
          )}
        </div>
      </div>
    </DemoToastProvider>
  );
}
