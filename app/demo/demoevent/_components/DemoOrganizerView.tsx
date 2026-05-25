import { DemoAdminTabs } from "./DemoAdminTabs";
import { DemoBottomNav } from "./DemoBottomNav";
import { DemoOverviewTab } from "./DemoOverviewTab";
import { DemoGalleryTab } from "./DemoGalleryTab";
import { DemoGuestsTab } from "./DemoGuestsTab";
import { DemoAnimatedTabContent } from "./DemoAnimatedTabContent";
import { ShareTab } from "@/app/(app)/events/[id]/_tabs/ShareTab";
import { DEMO_EVENT } from "../_data/demo-event";
import type { DemoTabId } from "../demo-role";

type Props = {
  selectedTab: DemoTabId;
  publicOrigin: string;
};

export function DemoOrganizerView({ selectedTab, publicOrigin }: Props) {
  return (
    <div style={{ padding: "0 0 100px" }}>
      <DemoAdminTabs />

      <DemoAnimatedTabContent selectedTab={selectedTab}>
        <div style={{ marginTop: 24, padding: "0 16px" }}>
          {selectedTab === "overview" && (
            <DemoOverviewTab publicOrigin={publicOrigin} />
          )}
          {selectedTab === "gallery" && <DemoGalleryTab />}
          {selectedTab === "guests" && <DemoGuestsTab />}
          {selectedTab === "share" && (
            <ShareTab
              eventId={DEMO_EVENT.id}
              accessCode={DEMO_EVENT.accessCode}
              eventTitle={DEMO_EVENT.name}
              publicOrigin={publicOrigin}
            />
          )}
        </div>
      </DemoAnimatedTabContent>

      <DemoBottomNav selectedTab={selectedTab} />
    </div>
  );
}
