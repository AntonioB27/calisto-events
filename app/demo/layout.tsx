import { DemoThemeLock } from "./_components/DemoThemeLock";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DemoThemeLock />
      {children}
    </>
  );
}
