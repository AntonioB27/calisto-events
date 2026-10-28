import { Aurora, type AuroraPose } from "@/components/app-ui/Aurora";

/** Top of an organizer tab: serif title, one sentence, Aurora on the right. Actions sit under the sentence. */
export function TabHeader({
  title,
  children,
  pose,
  poseSize = 110,
  actions,
}: Readonly<{
  title: string;
  children?: React.ReactNode;
  pose?: AuroraPose;
  poseSize?: number;
  actions?: React.ReactNode;
}>) {
  return (
    <div className="tab-header" style={{ paddingRight: pose ? poseSize + 8 : 0 }}>
      <h1 className="tab-header__title">{title}</h1>
      {children ? <p className="tab-header__sub">{children}</p> : null}
      {actions ? <div className="tab-header__actions">{actions}</div> : null}
      {pose ? <Aurora pose={pose} size={poseSize} className="tab-header__aurora" /> : null}
    </div>
  );
}
