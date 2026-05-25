import { AppUiProvider } from "@/components/AppUiProvider";
import { getAppStrings } from "@/lib/app-ui";
import { DemoThemeLock } from "./_components/DemoThemeLock";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const dict = getAppStrings("en");
  return (
    <AppUiProvider value={{ locale: "en", ...dict }}>
      <DemoThemeLock />
      {children}
    </AppUiProvider>
  );
}
